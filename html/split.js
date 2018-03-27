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
      container.appendChild(img)
      img.onload=()=>{
        console.log(img.width+''+img.height)
        ctx.drawImage(img,0,0)
      }
    }
  }
let fuck=document.getElementById('fuck')
fuck.onclick=()=>{
  console.log('click')
}
let canvas =document.getElementById('split') 
let ctx=canvas.getContext('2d')
