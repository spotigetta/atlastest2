@echo off
cd /d "%~dp0"
node generators\update-all.mjs
if errorlevel 1 (
  echo.
  echo No se pudo completar la actualizacion.
  pause
  exit /b 1
)
echo.
echo Atlas se ha actualizado correctamente.
pause
