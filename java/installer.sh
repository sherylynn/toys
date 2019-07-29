installer(){ local apk=$1; local byte=$(wc -c < ${apk}); cat $apk | pm install -S $byte ;}
# installer apk_path