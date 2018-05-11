"g
"我ightnd! VimerRPG :call s:main()
"wngg0
"negg0
"echom nr2char(75)
"echom char2nr("h")
"line坐标从1开始
"echom getline(1)[1]
"echom localtime()
function! s:drawCanvas(x, y)
    execute "normal ggdG"
"    execute "normal i "
    execute "normal i　"
    execute "normal vy" . a:x . "p"
    execute "normal yy" . a:y . "p"
endfunction
function! s:drawClear(x, y, tx, ty, char)
    execute "normal! " . a:y . 'gg0' . a:x . 'lr' . a:char . 'gg0'
endfunction
function! s:drawChar(x, y, char)
    exe "normal! " . a:y . 'gg0' . a:x . 'lR' . a:char
    exe "normal! " . 'gg0'
endfunction
func! s:help()
  let l:loop=1
  let l:direction='none'
  tabedit __canvas__
  while l:loop==1
    call s:drawCanvas(10,10)
    call s:drawChar(1,2,'我')
    call s:setColor()
    sleep 30ms
    redraw
  endwhile
endfunc
function! s:setLocalSetting()
    setlocal bufhidden=wipe
    setlocal buftype=nofile
    setlocal buftype=nowrite
    setlocal nocursorcolumn
    setlocal nocursorline
    setlocal nolist
    setlocal nonumber
    setlocal noswapfile
    setlocal nowrap
    setlocal nonumber
    setlocal norelativenumber
endfunction
function! s:setColor()
    syntax match canvas '　'
    syntax match canvas ' '
    highlight canvas ctermfg=white ctermbg=white guifg=white guibg=white
endfunction
call s:help()
"call s:setLocalSetting()
"　
"😀
"头上显示角色名,用map替换原生按键事件
"角色属性分icon name x y move-type
"icon是绘制字符
"name是头上字,一起移动
"建立组合移动函数
