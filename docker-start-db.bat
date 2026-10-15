@echo off
chcp 65001 >nul
title TalentMatch - MySQL Database Only
echo ========================================================
echo   🗄️ TalentMatch - Khởi động CSDL MySQL (Port 3306)
echo ========================================================
docker compose up -d mysql
pause
