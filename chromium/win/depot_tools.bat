::安装依赖的vstudio时，注意要去程序与功能里点开15063的sdk，然后change勾选debug tool
::set path for depot_tools first
::如果原来有GYP_MSVS_VERSION=2015的环境变量，记得删去
::看到官网的set DEPOT_TOOLS_WIN_TOOLCHAIN=0 不知道要不要
::万一下载失败，可以gclient sync
:: go to admin cmd depot_tools path
:: 使用本地的vstudio
set DEPOT_TOOLS_WIN_TOOLCHAIN=0
set http_proxy=http://127.0.0.1:10808/
set https_proxy=http://127.0.0.1:10808/
gclient
git config --global user.name "sherylynn"
git config --global user.email "352281674@qq.com"
git config --global core.autocrlf false
git config --global core.filemode false
git config --global branch.autosetuprebase
git config --global http.proxy "http://127.0.0.1:10808"
git config --global https.proxy "http://127.0.0.1:10808"
mkdir chromium && cd chromium
::slow
fetch chromium
::fast
fetch --no-history chromium 

