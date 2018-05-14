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
