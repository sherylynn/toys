NAME_FILE=img_names.txt
ERROR_LIST=not_found.txt
#IMG_DIR=img_dir
IMG_DIR=./
OUT_DIR=./out
SWAP_FILE=./swap.txt
#init ERROR_LIST
echo "">$ERROR_LIST
rm -rf $OUT_DIR
cat $NAME_FILE | while read img_name
do
  echo ""> $SWAP_FILE
  echo $img_name
  if [[ -n $img_name ]]; then
    ls $IMG_DIR |grep $img_name > $SWAP_FILE
    SWAP=$(ls $IMG_DIR |grep $img_name)
    if [[ -z $SWAP ]]; then
      echo $img_name >> $ERROR_LIST
    fi
    cat $SWAP_FILE | while read file_name
    do
      if [[ -n $file_name ]]; then
        mkdir -p $OUT_DIR/$img_name
        cp $IMG_DIR/$file_name $OUT_DIR/$img_name/        
      fi
    done
  fi
done
  
