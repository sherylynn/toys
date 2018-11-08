//import fs from 'fs'
const fs =require('fs')
const {promisify}=require('util')
const stat=promisify(fs.stat)
const readdir=promisify(fs.readdir)
let fuck =async ()=>{
  let dirList=await readdir('./')
  dirList.forEach(async (file)=>{
    let file_no_ext=file.split('.')[0]
    let file_ext=file.split('.').pop()
    if(file_ext=='docx'){
      let 科室=file_no_ext.split('【')[1].split('】')[0]
      let author=file_no_ext.split('【')[1].split('】')[1].split('.')[0].split('-')[0]
      let title=file_no_ext.split('【')[1].split('】')[1].split('.')[0].split('-')[1]
      let stats=await stat(file)
      console.log(科室+":"+author+':'+title+stats.mtime)
    }
  })
}
fuck()


;(function () { console.log(1) } )()


;(async ()=>{
  let dirList=await readdir('./')
  for (let index = 0; index < dirList.length; index++) {
    let file=dirList[index]
    let file_no_ext=file.split('.')[0]
    let file_ext=file.split('.').pop()
    if(file_ext=='docx'){
      let 科室=file_no_ext.split('【')[1].split('】')[0]
      let author=file_no_ext.split('【')[1].split('】')[1].split('.')[0].split('-')[0]
      let title=file_no_ext.split('【')[1].split('】')[1].split('.')[0].split('-')[1]
      let stats=await stat(file)
      console.log(科室+":"+author+':'+title+stats.mtime)
    }
  }

})()