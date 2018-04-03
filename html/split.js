  document.ondragover=function(e){
    e.preventDefault()
  }
  document.ondrop=function(e){
    e.preventDefault()
  }
  container.ondragover=function(e){
    e.preventDefault()
  }
  container.ondrop=function(e){
    let list=e.dataTransfer.files
    console.log(list)
    for (let i=0;i<list.length;i++){
      let f=list[i]
      Reader(f)
    }
  }
  let Reader=(f)=>{
    let reader=new FileReader()
    reader.readAsDataURL(f)
    reader.onload=()=>{
      let img=new Image()
      img.src=reader.result
      img.onload=()=>{
        console.log(img.width+''+img.height)
//        for( canvas in ["show","swap","split"]){
//        eval(canvas+".width=img.width")
//        eval(canvas+".height=img.height")
//        eval(canvas+"_ctx.drawImage(img,0,0)")
//        }
//        尝试失败
        show.width=img.width
        show.height=img.height
        show_ctx.drawImage(img,0,0)
        swap.width=img.width
        swap.height=img.height
        swap_ctx.drawImage(img,0,0)
        split.width=img.width
        split.height=img.height
        split_ctx.drawImage(img,0,0)

      }
    }
  }
let fuck=document.getElementById('fuck')
fuck.onclick=()=>{
  console.log('click')
  console.log(input.value)
  let size=input.value
  let cell_width=cw=show.width/size 
  let all_width=aw=show.width
  let all_height=ah=show.height
  let cell_height=ch=show.height/size 
  //画布里绘制画布非content
  //ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
  swap_ctx.drawImage(show,0,0)
  for (let i=1;i<size;i=i+2){
    swap_ctx.drawImage(show,(i-1)*cw,0,cw,ah,(i-1)/2*cw,0,cw,ah)
  }
  for (let j=2;j<size;j=j+2){
    swap_ctx.drawImage(show,(j-1)*cw,0,cw,ah,(j/2+size/2-1)*cw,0,cw,ah)
  }
  split_ctx.drawImage(swap,0,0)
  for (let i=1;i<size;i=i+2){
    split_ctx.drawImage(swap,0,(i-1)*ch,aw,ch,0,(i-1)/2*ch,aw,ch)
  }
  for (let j=2;j<size;j=j+2){
    split_ctx.drawImage(swap,0,(j-1)*ch,aw,ch,0,(j/2+size/2-1)*ch,aw,ch)
  }
}
let show_ctx=show.getContext('2d')
let swap_ctx=swap.getContext('2d')
let split_ctx=split.getContext('2d')
//测试补全----------------------
//let test_number=1
//let number_to_string=test_number.toStrin

