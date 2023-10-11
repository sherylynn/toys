adb push ./dev/aarch64/busybox-arm64 /data/local/tmp/busybox-arm64
adb push ./busybox_android_script.sh /data/local/tmp/busybox_android_script.sh
adb forward tcp:33333 tcp:33333
adb shell "su -c 'chmod 777 /data/local/tmp/busybox_android_script.sh & /data/local/tmp/busybox_android_script.sh'"
