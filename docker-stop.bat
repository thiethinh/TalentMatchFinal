@echo off
chcp 65001 >nul
title TalentMatch - Dung Container
echo ========================================================
echo   🛑 TalentMatch - Đang dừng toàn bộ Container...
echo ========================================================
docker compose down
pause
