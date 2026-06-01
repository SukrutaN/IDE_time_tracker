# IDE Time Tracker

Track IDE coding time and earn browsing time on entertainment websites.

## 🚀 Quick Start

### Prerequisites
- Java 11+
- Node.js 16+
- Google Chrome
- Maven 

### Setup (3 steps)

**1. Clone repo:**
```bash
git clone <your-repo-url>
cd IDE_time_tracker
```

**2. Build Java backend:**
```bash
cd ide-time-tracker
mvn clean package
cd ..
```

**3. Copy JARs and create startup script:**

**Windows (tracker-folder/start-tracker.bat):**
```batch
@echo off
cd /d "%~dp0"
java -jar ide-time-tracker-1.0-SNAPSHOT-jar-with-dependencies.jar
timeout /t 2
java -cp ide-time-tracker-1.0-SNAPSHOT-jar-with-dependencies.jar com.idetracker.TrackingServer
pause
```

**Mac/Linux (tracker-folder/start-tracker.sh):**
```bash
#!/bin/bash
java -jar ide-time-tracker-1.0-SNAPSHOT-jar-with-dependencies.jar &
sleep 2
java -cp ide-time-tracker-1.0-SNAPSHOT-jar-with-dependencies.jar com.idetracker.TrackingServer &
```

Create tracker-folder and copy:
```bash
mkdir tracker-folder
cp ide-time-tracker/target/ide-time-tracker-1.0-SNAPSHOT-jar-with-dependencies.jar tracker-folder/
```

**4. Load Chrome Extension:**
- Go to chrome://extensions/
- Enable Developer Mode
- Click "Load unpacked"
- Select `browser-extension/` folder

**5. Start everything:**
- Windows: Double-click `tracker-folder/start-tracker.bat`
- Mac/Linux: Run `tracker-folder/start-tracker.sh`
- Open your IDE and start coding!

### View Dashboard (Optional)
```bash
cd react-dashboard
npm install
npm run dev
```
Opens at http://localhost:3000

## 📖 Full Documentation
See [FINAL_SETUP.md](./FINAL_SETUP.md) for detailed setup and troubleshooting.

## 📁 Project Structure
- `ide-time-tracker/` - Java IDE tracker and HTTP server
- `browser-extension/` - Chrome extension
- `react-dashboard/` - React web dashboard (optional)

## 🔧 Technologies
- Java 11+ (backend)
- React (frontend)
- Chrome Extensions API
- Tailwind CSS

## 📄 License
Free to use and modify.