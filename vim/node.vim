augroup NodeJS
  autocmd!
  if !exists("*NodeJSable")
    func! NodeJSable(dir,filename)
      "其实这里的功能也可以直接用vim内置的 isdirectory 或者 filereadable
      let l:dir_command='ls ' . a:dir
      "注意，这里检索不到package.json的时候依然会出现  ls: cannot access 'package.json': No such file or directory ,
      "依然检索package.json永远会检测到
      let l:status=matchstr(system(l:dir_command),'\m\(' . a:filename . '\)\|\(such\)')
      if l:status==a:filename
        nnoremap <leader>t :AsyncRun npm test<CR>
        nnoremap <leader>b :AsyncRun npm run build<CR>
        nnoremap <leader>r :AsyncRun npm run start<CR>
        nnoremap <leader>d :AsyncRun npm run dev<CR>
      elseif l:status=="such"
      else
      endif
    endfunc
  endif
  autocmd BufNewFile,BufRead * nested call NodeJSable(expand('%:h'),"package.json")
augroup END
