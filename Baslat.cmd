@echo off
cd /d "%~dp0"
start "" "http://localhost:4783"
node server.cjs
pause
