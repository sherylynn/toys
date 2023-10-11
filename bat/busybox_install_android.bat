adb push dev/aarch64/busybox-arm64 /data/local/tmp/busybox-arm64
adb shell "su -c 'chmod 777 /data/local/tmp/busybox-arm64'"

adb forward tcp:33333 tcp:33333
adb shell "su -c 'ls -l /dev/block/bootdevice/by-name |grep userdata'"
adb shell "su -c 'dd bs=1m if=/dev/block/bootdevice/by-name/persist' | gzip |/data/local/tmp/busybox-arm64 nc -l -p 33333"
