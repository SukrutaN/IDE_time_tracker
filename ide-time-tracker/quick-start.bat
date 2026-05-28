@echo off
start java -jar ide-tracker.jar
timeout /t 2
start java -jar tracking-server.jar
echo Both services started. Extension is ready.
pause