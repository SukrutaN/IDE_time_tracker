package com.idetracker;

import com.google.gson.Gson;

import java.io.FileReader;

public class ConfigLoader {

    public static AppConfig loadConfig() {
        try {
            Gson gson = new Gson();

            FileReader reader = new FileReader("config.json");

            AppConfig config = gson.fromJson(reader, AppConfig.class);

            return config;

        } catch (Exception e) {

            System.err.println("Failed to load config.json");
            System.err.println(e.getMessage());

            return getDefaultConfig();
        }
    }

    private static AppConfig getDefaultConfig() {

        AppConfig config = new AppConfig();

        config.blockedSites = java.util.Arrays.asList(
                "youtube.com",
                "instagram.com"
        );

        config.trackedIDEKeywords = java.util.Arrays.asList(
                "code",
                "cursor",
                "intellij"
        );

        config.browseToCodeRatio = 0.5;

        config.serverPort = 8080;

        config.checkIntervalMs = 1000;

        return config;
    }
}