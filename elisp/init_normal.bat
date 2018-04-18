@echo off
%1 mshta vbscript:CreateObject("Shell.Application").ShellExecute("cmd.exe","/c %~s0 ::","","runas",1)(window.close)&&exit
cd /d "%~dp0"
@echo off
cls
setlocal EnableDelayedExpansion
@if not exist "%HOME%" @set HOME=%USERPROFILE%
call rm "%HOME%\.emacs.d\init.el"
call mklink "%HOME%\.emacs.d\init.el" "%HOME%\toys\elisp\init.el"
