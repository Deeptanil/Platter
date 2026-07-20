@echo off
title Platter Expo Server
echo Starting Expo Server (with cache clear)...
cd /d "%~dp0"
npx expo start --clear
pause
