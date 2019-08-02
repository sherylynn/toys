installer(){ local apk=$1; local byte=$(wc -c < ${apk}); cat $apk | pm install -S $byte ;}
# installer apk_path

## apk 反编译
apktool d aide.apk
## apk 重新编译
apktool.bat b aide -o aide_new.apk
## jarsigner 重新签名
jarsigner -verbose -keystore testUtils.jks -signedjar aide_sign.apk aide_new.apk testUtils