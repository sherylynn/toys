"g
"iommand! VimerRPG :call s:main()
"echom nr2char(75)
"echom char2nr("h")
"line坐标从1开始
"echom getline(1)[1]
"echom localtime()
function! s:drawCanvas(x, y)
    execute "normal ggdG"
    execute "normal i　"
    execute "normal vy" . a:x . "p"
    execute "normal yy" . a:y . "p"
endfunction
function! s:drawClear(x, y, tx, ty, char)
    execute "normal! " . a:y . 'gg0' . a:x . 'lr' . a:char . 'gg0'
endfunction
function! s:drawChar(x, y, char)
    execute "normal! " . a:y . 'gg0' . a:x . 'lr' . a:char . 'gg0'
endfunction
func! s:help()
  let l:loop=1
"  while l:loop==1
    let l:input = nr2char(getchar())
    execute "normal! G"
    call s:drawChar(1,2,l:input)
    if l:input == 'q'
      let l:loop = 0
"      bdelete!
    endif
    sleep 100ms
    redraw
"  endwhile
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
    highlight canvas ctermfg=white ctermbg=white guifg=white guibg=white
endfunction
"call s:help()
call s:drawCanvas(10,10)
"call s:setLocalSetting()
call s:setColor()
"　
"😀
