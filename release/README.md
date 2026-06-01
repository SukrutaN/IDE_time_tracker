# IDE Time Tracker

Track time spent coding in your IDE and earn browsing time for distracting websites.

---

# Features

- Tracks active IDE window time
- Earn browsing time while coding
- Blocks distracting websites when time runs out
- Configurable blocked websites
- Configurable IDE detection
- Works on Windows, Linux, and macOS
- Chrome extension integration
- Local-only system (no cloud/server)

---

# How It Works

1. Backend monitors your active window
2. Time spent in IDEs is recorded
3. Browser extension reads earned time
4. Time spent on blocked websites reduces balance
5. Websites become blocked when time runs out

---

# Requirements

## Windows

- Java 11 or newer
- Google Chrome

## Linux

- Java 11 or newer
- Google Chrome / Chromium
- xdotool

Install xdotool:

```bash
sudo apt install xdotool
```

## macOS

- Java 11 or newer
- Google Chrome

---

# Installation

## Step 1 — Start Backend

Open:

```text
release/backend
```

### Windows

Double-click:

```text
start.bat
```

### Linux/macOS

Run:

```bash
chmod +x start.sh
./start.sh
```

---

## Step 2 — Load Chrome Extension

1. Open:

```text
chrome://extensions
```

2. Enable:

```text
Developer Mode
```

3. Click:

```text
Load unpacked
```

4. Select:

```text
release/extension
```

5. Pin the extension

---

# Verify Setup

Open:

```text
http://localhost:8080/time-data
```

You should see JSON output.

Example:

```json
{
  "ide_time_seconds": 1200,
  "earned_browse_seconds": 600
}
```

---

# Configuration

Edit:

```text
backend/config.json
```

---

## Blocked Websites

```json
"blockedSites": [
  "youtube.com",
  "instagram.com",
  "reddit.com"
]
```

---

## Tracked IDEs

```json
"trackedIDEKeywords": [
  "code",
  "cursor",
  "intellij",
  "pycharm"
]
```

---

## Browse Ratio

```json
"browseToCodeRatio": 0.5
```

Meaning:

```text
1 coding minute = 0.5 browsing minutes
```

Examples:

| Value | Meaning |
|---|---|
| 0.5 | 2 coding min → 1 browsing min |
| 1.0 | 1:1 |
| 2.0 | 1 coding min → 2 browsing min |

---

# Troubleshooting

## Extension says server not connected

Verify backend is running:

```text
http://localhost:8080/time-data
```

---

## Linux IDE detection not working

Install xdotool:

```bash
sudo apt install xdotool
```

Verify:

```bash
xdotool getactivewindow getwindowname
```

---

## Port already in use

Edit:

```text
config.json
```

Change:

```json
"serverPort": 8080
```

---

## Reset all tracked data

Delete:

```text
~/ide_time_data.json
```

Windows:

```text
C:\Users\YOUR_NAME\ide_time_data.json
```

---

# Privacy

Everything runs locally on your machine.
No data is uploaded anywhere.

---

# Tech Stack

- Java
- JNA
- Chrome Extensions API
- Gson
- HTTP Server API

---

# License

MIT