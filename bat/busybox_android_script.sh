chmod 777 /data/local/tmp/busybox-arm64
ls -l /dev/block/bootdevice/by-name |grep userdata
dd bs=1m if=/dev/block/bootdevice/by-name/persist | gzip |/data/local/tmp/busybox-arm64 nc -l -p 33333
