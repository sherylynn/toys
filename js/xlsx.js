const fs =require('fs')
const ejsexcel = require("ejsexcel");
const {promisify}=require('util')
const stat=promisify(fs.stat)
const readdir=promisify(fs.readdir)
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
let fuck =async ()=>{
  let dirList=await readdir('./')
  let data=[]
  //数据源
  dirList.forEach(async (file)=>{
    let file_no_ext=file.split('.')[0]
    let file_ext=file.split('.').pop()
    if(file_ext=='docx'||file_ext=='doc'||file_ext=='wps'){
      let 科室=file_no_ext.split('【')[1].split('】')[0]
      let 作者=file_no_ext.split('【')[1].split('】')[1].split('.')[0].split('-')[0]
      let 标题=file_no_ext.split('【')[1].split('】')[1].split('.')[0].split('-')[1]
      let stats=await stat(file)
      let 时间=stats.mtime
      data.push({
        时间,科室,作者,标题
      })
      console.log(时间+":"+科室+':'+作者+":"+标题)
    }
  })
  //获得Excel模板的buffer对象
  const exlBuf = await readFileAsync("./work.xlsx");
  console.log(data)
  //用数据源(对象)data渲染Excel模板
  const exlBuf2 = await ejsexcel.renderExcel(exlBuf, data);
  await writeFileAsync("./test.xlsx", exlBuf2);
  console.log("生成test.xlsx");
}
fuck()
