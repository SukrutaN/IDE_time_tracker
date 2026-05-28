package com.idetracker;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Simple HTTP server to serve IDE tracking data to browser extension
 * Run this alongside IDETracker
 */
public class TrackingServer {
    
    private static final int PORT = 8080;
    private static final String DATA_FILE = "ide_time_data.json";
    private final Gson gson = new Gson();
    
    public void start() throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        
        // Endpoint to get tracking data
        server.createContext("/time-data", new TimeDataHandler());
        
        // Start server
        server.setExecutor(null);
        server.start();
        
        System.out.println("=".repeat(50));
        System.out.println("Tracking Data Server Started");
        System.out.println("=".repeat(50));
        System.out.println("Server running on: http://localhost:" + PORT);
        System.out.println("Browser extension can fetch data from: http://localhost:" + PORT + "/time-data");
        System.out.println("\nPress Ctrl+C to stop\n");
    }
    
    /**
     * Handler for /time-data endpoint
     */
    class TimeDataHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            
            // Set CORS headers to allow browser extension access
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET");
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            
            if ("GET".equals(exchange.getRequestMethod())) {
                try {
                    Path dataFilePath = Paths.get(System.getProperty("user.home"), DATA_FILE);
                    
                    if (Files.exists(dataFilePath)) {
                        // Read tracking data
                        String json = Files.readString(dataFilePath);
                        IDETracker.TrackingData data = gson.fromJson(json, IDETracker.TrackingData.class);
                        
                        // Calculate earned browse time (1 min per 2 min coding)
                        double earnedSeconds = data.totalSeconds / 2.0;
                        
                        // Create response JSON
                        JsonObject response = new JsonObject();
                        response.addProperty("ide_time_seconds", data.totalSeconds);
                        response.addProperty("earned_browse_seconds", earnedSeconds);
                        response.addProperty("earned_browse_minutes", earnedSeconds / 60.0);
                        response.addProperty("last_updated", data.lastUpdated);
                        
                        String responseJson = gson.toJson(response);
                        
                        // Send response
                        exchange.sendResponseHeaders(200, responseJson.getBytes().length);
                        OutputStream os = exchange.getResponseBody();
                        os.write(responseJson.getBytes());
                        os.close();
                        
                    } else {
                        // Data file not found
                        String error = "{\"error\": \"Tracking data not found. Run IDETracker first.\"}";
                        exchange.sendResponseHeaders(404, error.getBytes().length);
                        OutputStream os = exchange.getResponseBody();
                        os.write(error.getBytes());
                        os.close();
                    }
                    
                } catch (Exception e) {
                    String error = "{\"error\": \"" + e.getMessage() + "\"}";
                    exchange.sendResponseHeaders(500, error.getBytes().length);
                    OutputStream os = exchange.getResponseBody();
                    os.write(error.getBytes());
                    os.close();
                }
            } else {
                String error = "{\"error\": \"Method not allowed. Use GET.\"}";
                exchange.sendResponseHeaders(405, error.getBytes().length);
                OutputStream os = exchange.getResponseBody();
                os.write(error.getBytes());
                os.close();
            }
        }
    }
    
    public static void main(String[] args) {
        try {
            TrackingServer server = new TrackingServer();
            server.start();
            
            // Keep the server running
            Thread.currentThread().join();
            
        } catch (Exception e) {
            System.err.println("Server error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
