"augroup WorkDirNodeJS
"  autocmd!
"  if !exists("*NodeJSable")
"    func NodeJSable(dir,filename)
"      echom a:dir
"      let l:dir_command="ls " . a:dir . "/" . a:filename
"      echom matchstr(system(l:dir_command),'\m\(' . a:filename . '\)\|\(such\)')
"      let l:status=matchstr(system(l:dir_command),'\m\(' . a:filename . '\)\|\(such\)')
"      if l:status==a:filename
"        echom l:status
"        nnoremap <leader>t :AsyncRun npm test<CR>
"        nnoremap <leader>b :AsyncRun npm run build<CR>
"        nnoremap <leader>r :AsyncRun npm run start<CR>
"        nnoremap <leader>d :AsyncRun npm run dev<CR>
"      elseif l:status=="such"
"      else
"      endif
"    endfunc
"  endif
"  autocmd BufNewFile,BufRead * nested call NodeJSable(expand('%:h'),"package.json")
"augroup END
