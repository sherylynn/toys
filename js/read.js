const fs =require('fs')
const ejsexcel = require("ejsexcel");
const {promisify}=require('util')
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const XLSX = require('xlsx');
// let workbook = XLSX.readFile('./js/网站简讯2018.xlsx')
let workbook = XLSX.readFile('网站简讯2018.xlsx')

let worksheet = workbook.Sheets.Sheet1
let worksheet2 = workbook.Sheets.Sheet2

let result = XLSX.utils.sheet_to_json(worksheet,{header:'A'})
let result2 = XLSX.utils.sheet_to_json(worksheet2,{header:'A'})

let data=[]

let group = {
  'myk':'免疫科',
  'bgs':'办公室',
  'zhb':'综合办',
  'esk':'食品儿少科',
  'gwk':'环境与职业医学科',
  'jjk':'健康教育科',
  'jfk':'寄防科',
  'jyk':'检验科',
  'cfk':'传防科',
  'xjk':'性结科',
  'mfk':'慢防科'
}
function getData(result) {
  for (let _i = 0; _i < result.length; _i++) {
    const now = result[_i];
    if (typeof now['C'] == "string" && now['C'].indexOf('发布者') == 0) {
      let message = now['C']
      let 标题 = result[_i - 1]['C']
      let 科室 = group[message.split(' ')[1]]
      let 作者 = message.split(' ')[4]
      let 时间 = message.split('发布时间:')[1]
      data.push({
        时间,
        科室,
        作者,
        标题
      })
    } else {}
  }
}
getData(result)
getData(result2)
let writeFile=async(data)=>{
  //获得Excel模板的buffer对象
  const exlBuf = await readFileAsync("./work.xlsx");
  //用数据源(对象)data渲染Excel模板
  const exlBuf2 = await ejsexcel.renderExcel(exlBuf, data);
  await writeFileAsync("./test2.xlsx", exlBuf2);
  console.log("生成test2.xlsx");
}
writeFile(data)