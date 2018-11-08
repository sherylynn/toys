//import fs from 'fs'
const fs =require('fs')
const {promisify}=require('util')
const stat=promisify(fs.stat)

let fuck =async ()=>{
  let stats=await stat('fs.js')
  console.log(stats.atime)
}
fuck()


;(function () { console.log(1) } )()