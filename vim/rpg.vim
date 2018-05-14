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
let g:iconList={'player':'😈','cat':'🐈','turtle':'🐢','rabbit':'🐇','rome':'🏠','fire':'🔥','spark':'💥'}
let g:player={'x':2,'y':2,'icon':g:iconList.player,'name':'Ｌ'}
let g:NPC=[{'x':2,'y':2,'icon':g:iconList.cat,'name':'Ｃ'},{'x':3,'y':3,'icon':g:iconList.spark,'name':'　','pass':0},{'x':4,'y':3,'icon':g:iconList.spark,'name':'　','pass':0}]
"😀😻🎁
let g:seed=[{'x':2,'y':7,'icon':g:iconList.fire,'name':'Ｃ'}]
let g:width=15
let g:height=15
let g:messages={'greeting':'＂欢迎来到vim世界＂'}
function! s:drawRole(role)
  call s:drawChar(a:role.x,a:role.y-1,a:role.name)
  call s:drawChar(a:role.x,a:role.y,a:role.icon)
endfunction
function! s:drawChar(x, y, char)
    exe "normal! " . a:y . 'gg0' . a:x . 'lR' . a:char
    exe "normal! " . 'gg0'
endfunction
let g:loop=1
"nnoremap h :call move_h()<cr>
"nnoremap j :call move_j()<cr>
"nnoremap k :call move_k()<cr>
"nnoremap l :call move_l()<cr>
"nnoremap q :call game_q()<cr>
"func! s:move_h()
"  let g:player.x=g:player.x-1
"endfunc
"func! s:move_j()
"  let g:player.y=g:player.y+1
"endfunc
"func! s:move_k()
"  let g:player.y=g:player.y-1
"endfunc
"func! s:move_l()
"  let g:player.x=g:player.x+1
"endfunc
func! s:move_h(role,step)
  let a:role.x=a:role.x-a:step
endfunc
func! s:move_j(role,step)
  let a:role.y=a:role.y+a:step
endfunc
func! s:move_k(role,step)
  let a:role.y=a:role.y-a:step
endfunc
func! s:move_l(role,step)
  "需要根据实际坐标弄一个getcharxy
  if getline(a:role.y)[a:role.x+a:step]=='　'
    let a:role.x=a:role.x+a:step
  endif
endfunc
func! s:game_q()
  let g:loop=0
endfunc
func! s:help()
  let l:direction='none'
  tabedit __canvas__
  while g:loop==1
    let l:input = nr2char(getchar(0))
    if l:input == 'h'
      let l:direction = 'left'
      call s:move_h(g:player,1)
    elseif l:input == 'j'
      let l:direction = 'down'
      call s:move_j(g:player,1)
    elseif l:input == 'k'
      let l:direction = 'up'
      call s:move_k(g:player,1)
    elseif l:input == 'l'
      let l:direction = 'right'
      call s:move_l(g:player,1)
    elseif l:input == 'q'
      let g:loop = 0
      tabclose!
"      bdelete!
      break
    else
    endif
    call s:drawCanvas(g:width,g:height)
    for seed in g:seed
      call s:drawRole(seed)
    endfor
    for role in g:NPC
      call s:drawRole(role)
    endfor
    call s:drawRole(g:player)
    call s:drawChar(0,g:height,g:messages.greeting)
    call s:setLocalSetting()
    call s:setColor()
    sleep 30ms
    redraw
  endwhile
endfunc
"nnoremap h 
function! s:setLocalSetting()
		setlocal undolevels=-1
    setlocal ambiwidth=double
    "取消undo,性能优化
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
"    syntax match player '我'
    syntax match player '我'
    "全角引号
    syntax region messages start=/\v＂/ skip=/\v\\./ end=/\v＂/
    syntax match canvas ' '
"    syntax match NPC '猫'
"    highlight canvas ctermfg=white ctermbg=white guifg=white guibg=white
    highlight NPC ctermfg=white ctermbg=white guifg=white guibg=white
    highlight messages ctermfg=blue  guifg=blue 
    highlight player ctermfg=green ctermbg=green guifg=green guibg=green
endfunction
call s:help()
"call s:setLocalSetting()
"　
"头上显示角色名,用map替换原生按键事件
"角色属性分icon name x y move-type
"icon是绘制字符
"name是头上字,一起移动
"建立组合移动函数
"再构建一个画图工具,专门画地图,然后保存后就是地图和事件了
"可以专门建个事件图层,背后载入buffer,然后比对角色位置,进行判断
"把按键放map里不生效
"undo

"😀😻
