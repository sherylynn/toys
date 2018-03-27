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
        show_ctx.drawImage(img,0,0)
      }
    }
  }
let fuck=document.getElementById('fuck')
fuck.onclick=()=>{
  console.log('click')
  console.log(input.value)
  //画布里绘制画布非content
  //ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
  split_ctx.drawImage(show,0,0)
}
let show_ctx=document.getElementById('show').getContext('2d')
let split_ctx=document.getElementById('split').getContext('2d')
