// background.js - Service worker that manages time tracking and blocking

const SERVER_URL = 'http://localhost:8080/time-data';
const CHECK_INTERVAL = 5000; // Check server every 5 seconds

// Websites to block (you can customize this)
// const BLOCKED_SITES = [
//   'netflix.com',
//   'instagram.com',
//   'facebook.com',
//   'youtube.com',
//   'twitter.com',
//   'reddit.com',
//   'tiktok.com'
// ];

let BLOCKED_SITES = [];

// State management
let timeData = {
  earnedBrowseSeconds: 0,
  usedBrowseSeconds: 0,
  remainingSeconds: 0,
  lastUpdated: null
};

// Fetch time data from local server
async function fetchTimeData() {
  try {
    const response = await fetch(SERVER_URL);
    if (!response.ok) {
      console.error('Server not responding. Make sure tracking-server.jar is running.');
      return null;
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error fetching time data:', error);
    return null;
  }
}

async function fetchConfig() {
  try {
    const response = await fetch('http://localhost:8080/config');
    const config = await response.json();

    BLOCKED_SITES = config.blockedSites || [];

    console.log('Loaded config:', config);

  } catch (error) {
    console.error('Failed to load config:', error);
  }
}

// Update time balance
async function updateTimeBalance() {
  const data = await fetchTimeData();
  
  if (data) {
    // Get used time from storage
    const stored = await chrome.storage.local.get(['usedBrowseSeconds']);
    const usedSeconds = stored.usedBrowseSeconds || 0;
    
    // Calculate remaining time
    const remaining = data.earned_browse_seconds - usedSeconds;
    
    timeData = {
      earnedBrowseSeconds: data.earned_browse_seconds,
      usedBrowseSeconds: usedSeconds,
      remainingSeconds: Math.max(0, remaining),
      lastUpdated: new Date().toISOString()
    };
    
    // Store updated data
    await chrome.storage.local.set({ timeData });
    
    // Update blocking rules
    updateBlockingRules();
    
    console.log('Time updated:', {
      earned: Math.floor(data.earned_browse_minutes * 10) / 10,
      used: Math.floor(usedSeconds / 60 * 10) / 10,
      remaining: Math.floor(remaining / 60 * 10) / 10
    });
  }
}

// Update blocking rules based on remaining time
function updateBlockingRules() {
  if (timeData.remainingSeconds <= 0) {
    // No time left - enable blocking
    chrome.storage.local.set({ blockingEnabled: true });
  } else {
    // Time available - disable blocking
    chrome.storage.local.set({ blockingEnabled: false });
  }
}

// Track time spent on blocked sites
let currentTabId = null;
let lastCheckTime = Date.now();
let isOnBlockedSite = false;

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  currentTabId = activeInfo.tabId;
  await checkCurrentTab();
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId === currentTabId && changeInfo.url) {
    await checkCurrentTab();
  }
});

async function checkCurrentTab() {
  if (!currentTabId) return;
  
  try {
    const tab = await chrome.tabs.get(currentTabId);
    const url = tab.url || '';
    
    // Check if on blocked site
    const wasOnBlockedSite = isOnBlockedSite;
    isOnBlockedSite = BLOCKED_SITES.some(site => url.includes(site));
    
    // If just left a blocked site, save the time
    if (wasOnBlockedSite && !isOnBlockedSite) {
      const now = Date.now();
      const secondsSpent = Math.floor((now - lastCheckTime) / 1000);
      
      const stored = await chrome.storage.local.get(['usedBrowseSeconds']);
      const newTotal = (stored.usedBrowseSeconds || 0) + secondsSpent;
      await chrome.storage.local.set({ usedBrowseSeconds: newTotal });
      
      console.log(`Time spent: ${secondsSpent}s, Total used: ${newTotal}s`);
    }
    
    lastCheckTime = Date.now();
    
  } catch (error) {
    console.error('Error checking tab:', error);
  }
}

// Track time on blocked sites every second
setInterval(async () => {
  if (isOnBlockedSite && currentTabId) {
    const now = Date.now();
    const secondsSpent = Math.floor((now - lastCheckTime) / 1000);
    
    if (secondsSpent >= 1) {
      const stored = await chrome.storage.local.get(['usedBrowseSeconds']);
      const newTotal = (stored.usedBrowseSeconds || 0) + secondsSpent;
      await chrome.storage.local.set({ usedBrowseSeconds: newTotal });
      
      lastCheckTime = now;
      
      // Update balance
      await updateTimeBalance();
    }
  }
}, 1000);

// Periodic time data fetch from server
setInterval(updateTimeBalance, CHECK_INTERVAL);
setInterval(fetchConfig, 10000);

// Initial fetch on startup
fetchConfig();
updateTimeBalance();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTimeData') {
    sendResponse({ timeData });
  } else if (request.action === 'resetUsedTime') {
    chrome.storage.local.set({ usedBrowseSeconds: 0 });
    updateTimeBalance();
    sendResponse({ success: true });
  }
  return true;
});

console.log('IDE Time Blocker extension loaded');
