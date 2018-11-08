const ejsexcel = require("ejsexcel");
 const fs = require("fs");
 const util = require("util");
 const readFileAsync = util.promisify(fs.readFile);
 const writeFileAsync = util.promisify(fs.writeFile);
 
(async function() {
  //获得Excel模板的buffer对象
  const exlBuf = await readFileAsync("./test.xlsx");
  //数据源
  const data = [];
  //用数据源(对象)data渲染Excel模板
  const exlBuf2 = await ejsexcel.renderExcel(exlBuf, data);
  await writeFileAsync("./test2.xlsx", exlBuf2);
  console.log("生成test2.xlsx");
})();