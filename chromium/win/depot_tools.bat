::set path for depot_tools first
:: go to admin cmd depot_tools path
set http_proxy=http://127.0.0.1:10808/
set https_proxy=http://127.0.0.1:10808/
gclient
git config --global user.name "sherylynn"
