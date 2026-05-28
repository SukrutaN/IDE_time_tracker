#!/bin/bash
java -jar ide-tracker.jar &
sleep 2
java -jar tracking-server.jar &
echo "Both services started"