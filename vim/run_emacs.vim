func! Run_elisp()
  "光标在括号后，在normal下%匹配对应的括号，v可视模式到对应的%然后复制
  :normal %v%y
  let g:elisp_script=@"
"  :echom @"

"system会执行命令并返回结果，用echo来获取
  :echo system("emacs -Q -batch -eval '(prin1" . g:elisp_script . ")'")
  "执行命令如果要带参数，用execute
"  execute "!" . "emacs -Q -batch -eval '(prin1 " . g:elisp_script . ")'"
  :normal %
"  :!emacs -Q -batch -eval '(prin1 (+ 1 1))'
"  :!emacs -Q -batch -eval '(print (+ 1 1))'
  "<C-R>"
endfunc
nnoremap <silent><leader>fv :call Run_elisp()<CR>
"(+ 2 1)
