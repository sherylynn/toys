#事实证明这个方法行不通 fetch的时候会不行
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
echo 'export PATH="$PATH:$HOME/depot_tools"' >>  $HOME/.bashrc
#change to path to download chromium
fetch --nohooks --no-history android
