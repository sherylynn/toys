var fs=require("fs")
console.log("the pwd is:"+__dirname)
workdir={
  "__dirname":__dirname,
  "process.cwd()":process.cwd()
}
workdir_new=JSON.stringify(workdir,null,"\t")
fs.writeFile('golang_nodejs.json',workdir_new, 'utf8', (err) => {
  if (err) throw err;
  console.log('done');
});
