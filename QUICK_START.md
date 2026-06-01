# IDE Time Tracker - Developer Quick Start

## Prerequisites
- Java 11+
- Chrome/Chromium
- Node.js (optional, for dashboard)

## Install

```bash
# Clone repo
git clone <your-repo>
cd IDE_time_tracker

# Build backend
cd ide-time-tracker
mvn clean package
cd ..

# Setup tracker folder
mkdir tracker-folder
copy ide-time-tracker\target\ide-time-tracker-1.0-SNAPSHOT-jar-with-dependencies.jar tracker-folder\
```

**Windows:** Create `tracker-folder/start-tracker.bat`:
```batch
@echo off
cd /d "%~dp0"
start "IDE Tracker" java -jar ide-time-tracker-1.0-SNAPSHOT-jar-with-dependencies.jar
timeout /t 3
start "Server" java -cp ide-time-tracker-1.0-SNAPSHOT-jar-with-dependencies.jar com.idetracker.TrackingServer
```

**Mac/Linux:** Create `tracker-folder/start-tracker.sh`:
```bash
#!/bin/bash
java -jar ide-time-tracker-1.0-SNAPSHOT-jar-with-dependencies.jar &
sleep 3
java -cp ide-time-tracker-1.0-SNAPSHOT-jar-with-dependencies.jar com.idetracker.TrackingServer &
```

## Load Extension

1. Go to `chrome://extensions/`
2. Enable Developer Mode (top right)
3. Click "Load unpacked"
4. Select `browser-extension/` folder
5. Pin extension to toolbar

## Run

**Windows:**
```bash
tracker-folder/start-tracker.bat
```

**Mac/Linux:**
```bash
chmod +x tracker-folder/start-tracker.sh
./tracker-folder/start-tracker.sh
```

Wait for both windows to show "started".

## Test

1. **Verify server:** Open `http://localhost:8080/time-data` in browser → should show JSON
2. **Open IDE:** Use VS Code, IntelliJ, etc.
3. **Check extension:** Click extension icon → should show earned/used time
4. **Code for 2 min:** Extension should show increased earned time
5. **Visit Netflix/Instagram:** When time runs out, page blocks with message

## Optional: Dashboard

```bash
cd react-dashboard
npm install
npm run dev
```

Opens at `http://localhost:3000`

## Blocked Sites

Edit these files to customize:
- `browser-extension/background.js` line 6
- `browser-extension/popup.js` line 3

Both must match.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Server offline error | Check `http://localhost:8080/time-data` in browser. Restart if needed. |
| Only one window opens | Check second window for errors. May need to run Java commands separately. |
| IDE not detected | Wait 10 seconds. IDE window must be active. Check tracker console shows updates. |
| Port 8080 in use | Kill process: `netstat -ano \| findstr :8080` then `taskkill /PID <PID> /F` |

## Data Location

Tracking data saved to: `C:\Users\YourName\ide_time_data.json`

Delete this file to reset all data.

---

**That's it. Code, earn time, browse responsibly.** 🎮
