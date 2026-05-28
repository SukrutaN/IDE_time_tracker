// popup.js - Controls the extension popup UI

const BLOCKED_SITES = [
  'netflix.com',
  'instagram.com',
  'facebook.com',
  'youtube.com',
  'twitter.com',
  'reddit.com',
  'tiktok.com'
];

// Load and display time data
async function loadTimeData() {
  const content = document.getElementById('content');
  
  try {
    // Get time data from background script
    const response = await chrome.runtime.sendMessage({ action: 'getTimeData' });
    const timeData = response.timeData;
    
    if (!timeData || !timeData.lastUpdated) {
      content.innerHTML = `
        <div class="error">
          ⚠️ Server not connected<br>
          <small>Make sure tracking-server.jar is running on localhost:8080</small>
        </div>
      `;
      return;
    }
    
    const earnedMins = Math.floor(timeData.earnedBrowseSeconds / 60);
    const usedMins = Math.floor(timeData.usedBrowseSeconds / 60);
    const remainingMins = Math.floor(timeData.remainingSeconds / 60);
    const remainingSecs = Math.floor(timeData.remainingSeconds % 60);
    
    const progressPercent = timeData.earnedBrowseSeconds > 0 
      ? (timeData.remainingSeconds / timeData.earnedBrowseSeconds) * 100 
      : 0;
    
    content.innerHTML = `
      <div class="status">
        <div class="status-item">
          <span class="status-label">💰 Earned Time:</span>
          <span class="status-value">${earnedMins} min</span>
        </div>
        <div class="status-item">
          <span class="status-label">⏱️ Used Time:</span>
          <span class="status-value">${usedMins} min</span>
        </div>
        <div class="status-item">
          <span class="status-label">✨ Remaining:</span>
          <span class="status-value" style="color: ${remainingMins > 0 ? '#4ade80' : '#ff6b6b'}">
            ${remainingMins}:${remainingSecs.toString().padStart(2, '0')} min
          </span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progressPercent}%"></div>
        </div>
      </div>
      
      <div class="blocked-sites">
        <h2>🚫 Blocked Sites:</h2>
        <div class="site-list">
          ${BLOCKED_SITES.map(site => `• ${site}`).join('<br>')}
        </div>
      </div>
      
      <div class="actions">
        <button id="refresh-btn">🔄 Refresh</button>
        <button id="reset-btn" class="reset-btn">Reset Used</button>
      </div>
    `;
    
    // Add event listeners
    document.getElementById('refresh-btn').addEventListener('click', loadTimeData);
    document.getElementById('reset-btn').addEventListener('click', resetUsedTime);
    
  } catch (error) {
    console.error('Error loading time data:', error);
    content.innerHTML = `
      <div class="error">
        ⚠️ Error loading data<br>
        <small>${error.message}</small>
      </div>
      <div class="actions">
        <button id="retry-btn">🔄 Retry</button>
      </div>
    `;
    
    document.getElementById('retry-btn')?.addEventListener('click', loadTimeData);
  }
}

// Reset used time
async function resetUsedTime() {
  if (confirm('Reset all used browsing time? This will give you back all your earned time.')) {
    await chrome.runtime.sendMessage({ action: 'resetUsedTime' });
    loadTimeData();
  }
}

// Load data when popup opens
loadTimeData();

// Auto-refresh every 3 seconds
setInterval(loadTimeData, 1000);
