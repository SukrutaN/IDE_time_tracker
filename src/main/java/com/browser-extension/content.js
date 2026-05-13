// content.js - Runs on every page to check if it should be blocked

(async function() {
  // List of blocked sites (must match background.js)
  const BLOCKED_SITES = [
    'netflix.com',
    'instagram.com',
    'facebook.com',
    'youtube.com',
    'twitter.com',
    'reddit.com',
    'tiktok.com'
  ];
  
  // Check if current site is in blocked list
  const currentUrl = window.location.href;
  const isBlockedSite = BLOCKED_SITES.some(site => currentUrl.includes(site));
  
  if (!isBlockedSite) return;
  
  // Check if blocking is enabled
  const data = await chrome.storage.local.get(['blockingEnabled', 'timeData']);
  
  if (data.blockingEnabled) {
    // Block the page
    blockPage(data.timeData);
  }
})();

function blockPage(timeData) {
  // Stop page from loading
  window.stop();
  
  // Clear the page
  document.documentElement.innerHTML = '';
  
  // Create blocked page UI
  const blockedHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Site Blocked - Earn More Time</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .container {
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          padding: 60px 80px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          max-width: 600px;
        }
        
        .icon {
          font-size: 80px;
          margin-bottom: 20px;
        }
        
        h1 {
          font-size: 36px;
          margin-bottom: 20px;
          font-weight: 600;
        }
        
        .message {
          font-size: 18px;
          margin-bottom: 30px;
          opacity: 0.9;
          line-height: 1.6;
        }
        
        .time-info {
          background: rgba(255, 255, 255, 0.2);
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 30px;
        }
        
        .time-stat {
          margin: 10px 0;
          font-size: 16px;
        }
        
        .time-value {
          font-weight: bold;
          font-size: 24px;
        }
        
        .action {
          font-size: 20px;
          margin-top: 20px;
          font-weight: 500;
        }
        
        .emoji {
          font-size: 40px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">⏰</div>
        <h1>No Browse Time Left!</h1>
        <div class="message">
          You've used up all your earned browsing time. 
          Go back to your IDE and code to earn more!
        </div>
        
        <div class="time-info">
          <div class="time-stat">
            Earned: <span class="time-value">${formatTime(timeData?.earnedBrowseSeconds || 0)}</span>
          </div>
          <div class="time-stat">
            Used: <span class="time-value">${formatTime(timeData?.usedBrowseSeconds || 0)}</span>
          </div>
          <div class="time-stat">
            Remaining: <span class="time-value" style="color: #ff6b6b;">0 min</span>
          </div>
        </div>
        
        <div class="emoji">💻</div>
        <div class="action">
          Start coding to unlock this site!
        </div>
      </div>
    </body>
    </html>
  `;
  
  document.open();
  document.write(blockedHTML);
  document.close();
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')} min`;
}
