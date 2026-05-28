# IDE Time Tracker - Earn Browsing Time by Coding

A gamified productivity system that tracks your coding time and rewards you with controlled access to entertainment websites. The more you code, the more you can browse!

## 📋 Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

This project consists of three components:

1. **Java IDE Tracker** - Monitors which application is active on your computer and tracks time spent in IDEs
2. **Java HTTP Server** - Exposes tracking data via REST API for the browser extension
3. **Chrome Extension** - Blocks entertainment websites when you've used up your earned browsing time

**Default Ratio:** 2 minutes of coding = 1 minute of browsing (fully configurable)

## 🔄 How It Works

```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│   Coding    │         │              │         │   Browsing      │
│   in IDE    │────────▶│  Time Saved  │────────▶│   Entertainment │
│   (2 min)   │         │  to JSON     │         │   Sites (1 min) │
└─────────────┘         └──────────────┘         └─────────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ HTTP Server  │
                        │ Port 8080    │
                        └──────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │   Browser    │
                        │  Extension   │
                        └──────────────┘
```

1. IDE Tracker monitors your active window
2. When an IDE is detected, time is logged to `ide_time_data.json`
3. HTTP Server exposes this data at `http://localhost:8080/time-data`
4. Browser extension fetches data and tracks time on blocked sites
5. When browsing time runs out, blocked sites show a "earn more time" page

## ✨ Features

- ✅ **Cross-platform support** - Works on Windows, macOS, and Linux
- ✅ **Real-time tracking** - Updates every second
- ✅ **Persistent data** - Survives restarts
- ✅ **Customizable ratios** - Configure how much coding earns how much browsing
- ✅ **Customizable blocked sites** - Add/remove sites as needed
- ✅ **Visual time display** - Clean popup showing earned, used, and remaining time
- ✅ **Automatic blocking** - Sites blocked when time runs out
- ✅ **Easy reset** - Reset used time with one click

## 📦 Prerequisites

### For Java Application:

- **Java 11 or higher** - [Download](https://adoptium.net/)
- **Maven** (3.6+) or **Gradle** (7.0+) - [Maven Download](https://maven.apache.org/download.cgi) | [Gradle Download](https://gradle.org/install/)

### Platform-Specific Requirements:

- **Windows:** No additional requirements
- **macOS:** No additional requirements  
- **Linux:** Install `xdotool`
  ```bash
  sudo apt-get install xdotool
  ```

### For Browser Extension:

- **Google Chrome** or **Chromium-based browser** (Edge, Brave, Opera)
- Chrome version 88+ (for Manifest V3 support)

## 🚀 Installation

### Step 1: Clone or Download the Project

```bash
git clone https://github.com/yourusername/ide-time-tracker.git
cd ide-time-tracker
```

Or download and extract the ZIP file.

### Step 2: Build the Java Application

#### Using Maven:

```bash
cd ide-time-tracker
mvn clean package
```

This creates two JAR files in `target/`:
- `ide-tracker.jar` - The IDE time tracker
- `tracking-server.jar` - The HTTP server

#### Using Gradle:

```bash
cd ide-time-tracker
./gradlew build
```

This creates two JAR files in `build/libs/`:
- `ide-tracker.jar`
- `tracking-server.jar`

### Step 3: Set Up the Browser Extension

1. **Add Extension Icons (Optional):**
   
   Create or download three PNG files and place in `browser-extension/icons/`:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)
   
   Quick option: Download from [favicon.io](https://favicon.io/emoji-favicons/alarm-clock/)

2. **Load Extension in Chrome:**
   
   - Open Chrome and go to `chrome://extensions/`
   - Enable **Developer Mode** (toggle in top-right)
   - Click **Load unpacked**
   - Select the `browser-extension` folder
   - Pin the extension by clicking the puzzle piece icon → pin icon

## 💻 Usage

### Starting the System

You need to run **two Java applications** simultaneously:

#### Terminal 1: Start the IDE Tracker

**Maven:**
```bash
java -jar target/ide-tracker.jar
```

**Gradle:**
```bash
java -jar build/libs/ide-tracker.jar
```

**Expected Output:**
```
==================================================
IDE Time Tracker Started
==================================================
Tracking data saved to: C:\Users\YourName\ide_time_data.json
Current IDE time: 0 seconds (0.0 minutes)
Earned browse time: 0.0 seconds (0.0 minutes)

Monitoring... (Press Ctrl+C to stop)
```

#### Terminal 2: Start the HTTP Server

**Maven:**
```bash
java -jar target/tracking-server.jar
```

**Gradle:**
```bash
java -jar build/libs/tracking-server.jar
```

**Expected Output:**
```
==================================================
Tracking Data Server Started
==================================================
Server running on: http://localhost:8080
Browser extension can fetch data from: http://localhost:8080/time-data

Press Ctrl+C to stop
```

### Using the System

1. **Code in your IDE** (VS Code, IntelliJ, Eclipse, etc.)
   - The tracker will automatically detect and log time
   - You'll see updates every 10 seconds in the terminal

2. **Check your time balance**
   - Click the extension icon in Chrome toolbar
   - See earned, used, and remaining time

3. **Browse entertainment sites**
   - Visit Netflix, Instagram, YouTube, etc.
   - Extension tracks your browsing time
   - When time runs out, sites are blocked with a friendly message

4. **Earn more time**
   - Go back to coding in your IDE
   - Browse time automatically increases

### Stopping the System

Press `Ctrl+C` in both terminal windows to stop the tracker and server.

## ⚙️ Configuration

### Customize Blocked Websites

Edit **both** of these files (must match):

**1. `browser-extension/background.js` (Line 6):**
```javascript
const BLOCKED_SITES = [
  'netflix.com',
  'instagram.com',
  'facebook.com',
  'youtube.com',
  'twitter.com',
  'reddit.com',
  'tiktok.com',
  'your-site-here.com'  // Add your sites
];
```

**2. `browser-extension/popup.js` (Line 3):**
```javascript
const BLOCKED_SITES = [
  // Same list as background.js
];
```

After editing, reload the extension at `chrome://extensions/`

### Change the Time Ratio

Edit `src/main/java/com/idetracker/IDETracker.java`:

```java
/**
 * Calculate browse time earned
 */
public double getEarnedBrowseTime() {
    // Current: 2:1 ratio (2 min coding = 1 min browsing)
    return data.totalSeconds / 2.0;
    
    // For 1:1 ratio (equal time):
    // return data.totalSeconds;
    
    // For 3:1 ratio (3 min coding = 1 min browsing):
    // return data.totalSeconds / 3.0;
}
```

After editing, rebuild the project:
```bash
mvn clean package
```

### Add More IDEs to Track

Edit `src/main/java/com/idetracker/IDETracker.java` (around line 30):

```java
private final Set<String> ideNames = new HashSet<>(Arrays.asList(
    "code", "Code",           // VS Code
    "cursor", "Cursor",       // Cursor
    "intellij", "idea",       // IntelliJ IDEA
    "pycharm", "PyCharm",     // PyCharm
    "eclipse", "Eclipse",     // Eclipse
    "YourIDE"                 // Add your IDE here
));
```

Rebuild after making changes.

### Change Server Port

Edit `src/main/java/com/idetracker/TrackingServer.java` (Line 19):

```java
private static final int PORT = 8080;  // Change to desired port
```

Also update the extension's `browser-extension/background.js` (Line 3):

```javascript
const SERVER_URL = 'http://localhost:8080/time-data';  // Update port
```

### Change Check Intervals

**IDE Tracker** - `IDETracker.java` (Line 19):
```java
private static final int CHECK_INTERVAL_MS = 1000;  // milliseconds
```

**Browser Extension** - `background.js` (Line 4):
```javascript
const CHECK_INTERVAL = 5000;  // milliseconds
```

## 🔧 Troubleshooting

### Java Application Issues

#### "Command not found: mvn" or "Command not found: java"

**Problem:** Java or Maven not installed or not in PATH

**Solution:**
- Install Java 11+: https://adoptium.net/
- Install Maven: https://maven.apache.org/download.cgi
- Verify installation:
  ```bash
  java -version
  mvn -version
  ```

#### "Unable to access jarfile target/ide-tracker.jar"

**Problem:** JAR file not built or running from wrong directory

**Solution:**
```bash
# Navigate to project directory
cd C:\Projects\boss\ide-time-tracker

# Rebuild
mvn clean package

# Run
java -jar target/ide-tracker.jar
```

#### IDE Not Being Detected

**Problem:** Your IDE's process name isn't in the tracked list

**Solution:**
1. Find your IDE's process name:
   - **Windows:** Open Task Manager → Details tab
   - **Mac:** Open Activity Monitor
   - **Linux:** Run `ps aux | grep <your-ide>`

2. Add it to `IDETracker.java` in the `ideNames` set
3. Rebuild: `mvn clean package`

#### Linux: "xdotool: command not found"

**Problem:** Missing required dependency

**Solution:**
```bash
sudo apt-get update
sudo apt-get install xdotool
```

### Browser Extension Issues

#### "Server not connected" in popup

**Problem:** Extension can't reach the Java server

**Solution:**
1. Verify server is running: Visit `http://localhost:8080/time-data` in browser
2. Check that you see JSON data
3. Restart `tracking-server.jar` if needed
4. Check firewall isn't blocking port 8080

#### Sites Not Getting Blocked

**Problem:** Blocking logic not working

**Solutions:**
1. Verify the site is in your `BLOCKED_SITES` list in **both** files
2. Check you've actually used up all time (click extension popup)
3. Reload the extension at `chrome://extensions/`
4. Hard refresh the blocked page: `Ctrl + Shift + R`
5. Check browser console for errors: `F12` → Console tab

#### Extension Disappeared After Chrome Restart

**Problem:** Chrome disabled the extension

**Solution:**
1. Go to `chrome://extensions/`
2. Find "IDE Time Blocker"
3. Toggle it back on

#### Time Not Being Tracked

**Problem:** Extension not counting browsing time

**Solution:**
1. Ensure site is in `BLOCKED_SITES` list
2. Check that both Java programs are running
3. Click extension icon to verify data is updating
4. Check browser console: `F12` → Console → look for errors

#### Icons Showing as Puzzle Pieces

**Problem:** Missing icon files

**Solution:**
- Add PNG files to `browser-extension/icons/` folder
- Use any images or download from [favicon.io](https://favicon.io)
- Extension works without icons, just looks less polished

### Data Issues

#### Want to Reset All Time

**Solution:**
- **Via Extension:** Click extension icon → "Reset Used" button
- **Via File:** Delete `~/ide_time_data.json` and restart tracker

#### Data File Location

The tracking data is saved at:
- **Windows:** `C:\Users\YourName\ide_time_data.json`
- **Mac/Linux:** `~/ide_time_data.json`

## 📁 Project Structure

```
ide-time-tracker/
├── pom.xml                                    # Maven build configuration
├── build.gradle                               # Gradle build configuration
├── README.md                                  # This file
│
├── src/main/java/com/idetracker/
│   ├── IDETracker.java                       # Main tracker application
│   └── TrackingServer.java                   # HTTP REST API server
│
└── browser-extension/
    ├── manifest.json                          # Extension configuration
    ├── background.js                          # Service worker (main logic)
    ├── content.js                             # Content script (page blocking)
    ├── popup.html                             # Popup UI structure
    ├── popup.js                               # Popup UI logic
    ├── rules.json                             # Declarative net request rules
    ├── INSTALL.md                             # Extension setup guide
    └── icons/                                 # Extension icons
        ├── icon16.png
        ├── icon48.png
        └── icon128.png
```

## 🎮 API Reference

### GET /time-data

Retrieves current time tracking data.

**URL:** `http://localhost:8080/time-data`

**Method:** `GET`

**Success Response:**

```json
{
  "ide_time_seconds": 3600,
  "earned_browse_seconds": 1800,
  "earned_browse_minutes": 30.0,
  "last_updated": "2024-02-09T15:30:00"
}
```

**Error Responses:**

- **404 Not Found:** Tracking data file doesn't exist (run IDE tracker first)
- **500 Internal Server Error:** Server error reading data file

## 🚀 Advanced Usage

### Running on Startup

#### Windows

1. Build the project
2. Create `start-tracker.bat`:
   ```batch
   @echo off
   start java -jar "C:\path\to\ide-tracker.jar"
   start java -jar "C:\path\to\tracking-server.jar"
   ```
3. Place in Startup folder: `Win+R` → `shell:startup`

#### macOS

1. Create `start-tracker.command`:
   ```bash
   #!/bin/bash
   java -jar /path/to/ide-tracker.jar &
   java -jar /path/to/tracking-server.jar &
   ```
2. Make executable: `chmod +x start-tracker.command`
3. Add to System Preferences → Users & Groups → Login Items

#### Linux

Add to crontab:
```bash
@reboot java -jar /path/to/ide-tracker.jar &
@reboot java -jar /path/to/tracking-server.jar &
```

### Using with Multiple Computers

The extension only works with a local server. For multi-computer setups:

1. Deploy the HTTP server to a shared network location
2. Update `SERVER_URL` in `background.js` to point to server IP
3. Ensure firewall allows connections on port 8080

### Logging and Monitoring

Add logging to track usage patterns:

```java
// In IDETracker.java
if (isIDEActive(windowName)) {
    data.totalSeconds += CHECK_INTERVAL_MS / 1000;
    
    // Add session tracking
    String sessionEntry = LocalDateTime.now() + " - IDE Active";
    data.sessions.add(sessionEntry);
}
```

## 🤝 Contributing

Contributions are welcome! Here are some ways to contribute:

- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit pull requests

### Feature Ideas

- [ ] Statistics dashboard (total time coded, most productive hours)
- [ ] Firefox extension support
- [ ] Weekly/monthly reports
- [ ] Notification when time is running low
- [ ] Multiple time budgets (social media, entertainment, news)
- [ ] Mobile app integration
- [ ] Cloud sync for multiple devices
- [ ] Pomodoro timer integration
- [ ] Whitelist mode (block all except certain sites)

## 📄 License

This project is free to use and modify for personal and educational purposes.

## 🙏 Acknowledgments

Built with:
- Java 11+
- JNA (Java Native Access) for window detection
- Gson for JSON serialization
- Chrome Extension APIs (Manifest V3)

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the console output for error messages
3. Verify all prerequisites are installed
4. Check that all three components are running simultaneously

## 🎯 Tips for Maximum Productivity

1. **Set realistic ratios** - Start with 2:1 or 3:1, not 10:1
2. **Be selective with blocked sites** - Only block your biggest distractions
3. **Check your balance regularly** - Use the popup to stay aware of time
4. **Don't reset constantly** - Let the system work as intended
5. **Adjust as needed** - Fine-tune ratios based on your habits

---

**Happy Coding! 💻✨**

Remember: The goal is sustainable productivity, not punishment. Use this tool to build better habits, not to stress yourself out.