package com.idetracker;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.sun.jna.Native;
import com.sun.jna.platform.win32.User32;
import com.sun.jna.platform.win32.WinDef;
import com.sun.jna.platform.win32.WinUser;

import java.io.*;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * IDE Time Tracker
 * Monitors active window and tracks time spent in IDEs
 */
public class IDETracker {
    
    private static final int CHECK_INTERVAL_MS = 1000; // Check every second
    private static final String DATA_FILE = "ide_time_data.json";
    
    private final Path dataFilePath;
    private final Gson gson;
    private TrackingData data;
    
    // List of IDE process/window names to track
    private final Set<String> ideNames = new HashSet<>(Arrays.asList(
        "code", "Code",           // VS Code
        "cursor", "Cursor",       // Cursor
        "intellij", "idea",       // IntelliJ IDEA
        "pycharm", "PyCharm",     // PyCharm
        "webstorm", "WebStorm",   // WebStorm
        "android studio",         // Android Studio
        "eclipse", "Eclipse",     // Eclipse
        "netbeans", "NetBeans",   // NetBeans
        "sublime", "Sublime",     // Sublime Text
        "vim", "nvim", "emacs"    // Terminal editors
    ));
    
    public IDETracker() {
        this.dataFilePath = Paths.get(System.getProperty("user.home"), DATA_FILE);
        this.gson = new GsonBuilder().setPrettyPrinting().create();
        loadData();
    }
    
    /**
     * Load existing tracking data or create new
     */
    private void loadData() {
        if (Files.exists(dataFilePath)) {
            try {
                String json = Files.readString(dataFilePath);
                data = gson.fromJson(json, TrackingData.class);
                System.out.println("Loaded existing data: " + data.totalSeconds + " seconds tracked");
            } catch (IOException e) {
                System.err.println("Error loading data file, creating new: " + e.getMessage());
                createNewData();
            }
        } else {
            createNewData();
        }
    }
    
    private void createNewData() {
        data = new TrackingData();
        data.totalSeconds = 0;
        data.lastUpdated = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME);
        data.sessions = new ArrayList<>();
    }
    
    /**
     * Save tracking data to file
     */
    private void saveData() {
        try {
            data.lastUpdated = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME);
            String json = gson.toJson(data);
            Files.writeString(dataFilePath, json);
        } catch (IOException e) {
            System.err.println("Error saving data: " + e.getMessage());
        }
    }
    
    /**
     * Get the name of the currently active window (Windows implementation)
     */
    private String getActiveWindowName() {
        try {
            if (isWindows()) {
                return getActiveWindowNameWindows();
            } else if (isMac()) {
                // macOS implementation would use JNA with Cocoa
                return getActiveWindowNameMac();
            } else if (isLinux()) {
                return getActiveWindowNameLinux();
            }
        } catch (Exception e) {
            System.err.println("Error getting active window: " + e.getMessage());
        }
        return "";
    }
    
    /**
     * Windows implementation using JNA
     */
    private String getActiveWindowNameWindows() {
        char[] buffer = new char[1024];
        WinDef.HWND hwnd = User32.INSTANCE.GetForegroundWindow();
        User32.INSTANCE.GetWindowText(hwnd, buffer, buffer.length);
        return Native.toString(buffer).toLowerCase();
    }
    
    /**
     * macOS implementation using command line
     */
    private String getActiveWindowNameMac() {
        try {
            Process process = Runtime.getRuntime().exec(new String[]{
                "osascript", "-e",
                "tell application \"System Events\" to get name of first application process whose frontmost is true"
            });
            
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String result = reader.readLine();
            process.waitFor();
            return result != null ? result.toLowerCase() : "";
        } catch (Exception e) {
            return "";
        }
    }
    
    /**
     * Linux implementation using xdotool
     */
    private String getActiveWindowNameLinux() {
        try {
            Process process = Runtime.getRuntime().exec(new String[]{
                "xdotool", "getactivewindow", "getwindowname"
            });
            
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String result = reader.readLine();
            process.waitFor();
            return result != null ? result.toLowerCase() : "";
        } catch (Exception e) {
            return "";
        }
    }
    
    /**
     * Check if current window is an IDE
     */
    private boolean isIDEActive(String windowName) {
        for (String ideName : ideNames) {
            if (windowName.contains(ideName.toLowerCase())) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Calculate browse time earned (1 min browse per 2 min coding)
     */
    public double getEarnedBrowseTime() {
        return data.totalSeconds / 2.0;
    }
    
    /**
     * Main tracking loop
     */
    public void run() {
        System.out.println("=".repeat(50));
        System.out.println("IDE Time Tracker Started");
        System.out.println("=".repeat(50));
        System.out.println("Tracking data saved to: " + dataFilePath);
        System.out.println("Current IDE time: " + data.totalSeconds + " seconds (" + 
                          (data.totalSeconds / 60.0) + " minutes)");
        System.out.println("Earned browse time: " + String.format("%.1f", getEarnedBrowseTime()) + 
                          " seconds (" + String.format("%.1f", getEarnedBrowseTime() / 60.0) + " minutes)");
        System.out.println("\nMonitoring... (Press Ctrl+C to stop)\n");
        
        // Add shutdown hook to save data on exit
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("\n\nStopping tracker...");
            saveData();
            System.out.println("Final IDE time: " + String.format("%.1f", data.totalSeconds / 60.0) + " minutes");
            System.out.println("Earned browse time: " + String.format("%.1f", getEarnedBrowseTime() / 60.0) + " minutes");
        }));
        
        int saveCounter = 0;
        
        while (true) {
            try {
                String windowName = getActiveWindowName();
                
                if (isIDEActive(windowName)) {
                    data.totalSeconds += CHECK_INTERVAL_MS / 1000;
                    
                    // Print update every 10 seconds
                    if (data.totalSeconds % 10 == 0) {
                        double ideMinutes = data.totalSeconds / 60.0;
                        double browseMinutes = getEarnedBrowseTime() / 60.0;
                        System.out.printf("IDE Time: %.1f min | Earned Browse Time: %.1f min%n", 
                                        ideMinutes, browseMinutes);
                    }
                    
                    // Save every 30 seconds
                    saveCounter += CHECK_INTERVAL_MS / 1000;
                    if (saveCounter >= 30) {
                        saveData();
                        saveCounter = 0;
                    }
                }
                
                Thread.sleep(CHECK_INTERVAL_MS);
                
            } catch (InterruptedException e) {
                break;
            }
        }
    }
    
    // OS detection helpers
    private static boolean isWindows() {
        return System.getProperty("os.name").toLowerCase().contains("win");
    }
    
    private static boolean isMac() {
        return System.getProperty("os.name").toLowerCase().contains("mac");
    }
    
    private static boolean isLinux() {
        return System.getProperty("os.name").toLowerCase().contains("nux");
    }
    
    /**
     * Data class for JSON serialization
     */
    static class TrackingData {
        int totalSeconds;
        String lastUpdated;
        List<String> sessions;
    }
    
    public static void main(String[] args) {
        // Print OS-specific setup instructions
        if (isWindows()) {
            System.out.println("Windows detected - JNA will be used for window detection");
        } else if (isMac()) {
            System.out.println("macOS detected - using AppleScript for window detection");
        } else if (isLinux()) {
            System.out.println("Linux detected - make sure xdotool is installed:");
            System.out.println("  sudo apt-get install xdotool");
        }
        
        System.out.println("\n" + "=".repeat(50) + "\n");
        
        IDETracker tracker = new IDETracker();
        tracker.run();
    }
}
