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
cd src
gn args out/test
::然后输入自己的api，然后一些优化设置
::#fast build
use_jumbo_build = true
is_component_build = true
::# no debug for just use
remove_webcore_debug_symbols = true
symbol_level = 1
::start build
autoninja -C out\test chrome
::for release
gn args out/build
::
is_debug = false
is_component_build = false
autoninja -C out\build chrome
::------------------------------
::上面的没产出，又大又久
::学习别人的
gn args out\release

use_jumbo_build = true
chrome_pgo_phase = 0
current_cpu = "x64"
enable_google_now = false
enable_hotwording = false
enable_iterator_debugging = false
enable_nacl = true
ffmpeg_branding = "Chrome"
is_component_build = false
is_debug = false
is_win_fastlink = true
proprietary_codecs = true
symbol_level = 0
syzygy_optimize = true
target_cpu = "x64"
exclude_unwind_tables = true
remove_webcore_debug_symbols = true
proprietary_codecs = true
enable_hangout_services_extension = true
enable_ac3_eac3_audio_demuxing = true
enable_hevc_demuxing = true
enable_mse_mpeg2ts_stream_parser = true
enable_webrtc = true
enable_widevine = true
rtc_use_h264 = true
rtc_use_lto = true
use_openh264 = true
::-------
autoninja -C out/release mini_installer.exe
::test 和最后的版本要编译的东西都比较小，build比较大
