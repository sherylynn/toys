"g
"lommand! VimerRPG :call s:main()
"echom nr2char(75)
"echom char2nr("h")
"line坐标从1开始
"echom getline(1)[1]
"echom localtime()
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
call s:help()

😀
