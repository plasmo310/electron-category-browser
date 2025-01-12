@echo off
setlocal

REM Setup Envs.
set APP_NAME=electron-category-browser
set SETUP_EXE_PATH=%~dp0squirrel.windows\x64\electron-category-browser-setup.exe
set CUSTOM_SHORTCUT_PATH=%~dp0CategoryBrowser.lnk
set INSTALL_DIR=%LOCALAPPDATA%\electron_category_browser

set COPY_FROM_ICON_PATH=%~dp0resources\shortcut_icon.ico
set COPY_TO_ICON_PATH=%INSTALL_DIR%\shortcut_icon.ico

set UPDATE_EXE_PATH=%INSTALL_DIR%\Update.exe
set APP_EXE_NAME=%APP_NAME%.exe
set DEFAULT_SHORTCUT_PATH=%USERPROFILE%\Desktop\%APP_NAME%.lnk

REM Execute Setup exe.
echo Start Setup...

if not exist %SETUP_EXE_PATH% (
    echo Not found setup exe.
    pause
    exit /b 1
)
%SETUP_EXE_PATH%

echo %UPDATE_EXE_PATH%

REM Check Complete Setup.
if not exist %UPDATE_EXE_PATH% (
    echo Failed Setup. Please try again.
    pause
    exit /b 1
)
echo Successfully Setup.

REM Create Shortcut.
echo Start Create Shortcut...

if exist %DEFAULT_SHORTCUT_PATH% (
    echo Delete default shortcut.
    del %DEFAULT_SHORTCUT_PATH%
)

if exist %COPY_FROM_ICON_PATH% (
    echo Deploy shortcut icon.
    copy %COPY_FROM_ICON_PATH% %COPY_TO_ICON_PATH%
)

powershell -Command ^
$wsh = New-Object -ComObject WScript.Shell; ^
$shortcut = $wsh.CreateShortcut('%CUSTOM_SHORTCUT_PATH%'); ^
$shortcut.TargetPath = '%UPDATE_EXE_PATH%'; ^
$shortcut.Arguments = '--processStart %APP_EXE_NAME%'; ^
$shortcut.WorkingDirectory = '%INSTALL_DIR%'; ^
$shortcut.IconLocation = '%COPY_TO_ICON_PATH%'; ^
$shortcut.Save()

echo Successfully Create Shortcut.

pause

endlocal
