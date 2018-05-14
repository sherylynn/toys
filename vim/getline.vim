"　坐标是1,1开始的
"
func! s:findChar(x,y)
  exe "normal!" . a:y . "gg"
  "此处得有括号，无括号会有问题
  exe "normal!" . (a:x-1) . "l"
  exe "normal!" . "vy"
  return @"
endfunc
"echom getline(1)[0]
func! s:posChar(x,y)
  return getline(a:y)[a:x-1]
endfunc
"echom s:posChar(2,1)
if getline(1)[2]=='　'
  echom 1
elseif getline(1)[2]=='<80>'
  echom 2
else 
"  echom getline(1)[2]
endif
echom s:findChar(2,1)
"finish
"getline 获得字符串后，再尝试通过[x]却不能获得正常的字符
"不能通过纯map的形式来操作，因为不然没有定时器的功能，其他物体不会自动触发
"或许通过异步来进行计算和更新？
"或许像双层canvas一样，先把数据放内存，然后操作不同字符的更新
"然后一次性把每次的字符绘制进去，这样减少了开销
"或者在上面的绘制再加一层diff后绘制
let s:blankChar='　'
"let s:blankChar='a'
let s:canvasListX=[]
let s:i=0
while s:i < 10
  call add(s:canvasListX,s:blankChar)
  let s:i=s:i+1
endwhile
let s:canvasList=[]
let s:i=0
while s:i< 10
  call add(s:canvasList,s:canvasListX)
  let s:i=s:i+1
endwhile
echo s:canvasList
"s:canvasList就是内存中的游戏地图
"接下来可以考虑用摄像头的形式，只绘制这个游戏地图的局部内容，来达到摄像头的移动效果
for ListX in s:canvasList
  for j in ListX
    let j='b'
"    echom j
  endfor
endfor
echo s:canvasList
"好像let j的指针没有变，不生效
let s:i=0
while s:i < 10
  let s:canvasListX[s:i]=s:blankChar
  let s:i=s:i+1
endwhile
let s:i=0
while s:i< 10
  let s:canvasList[s:i]=s:canvasListX
  let s:i=s:i+1
endwhile
echo s:canvasList
"while的方式生效了
"
