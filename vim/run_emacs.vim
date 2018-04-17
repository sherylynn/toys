func! Run_elisp()
  "光标在括号后，在normal下%匹配对应的括号，v可视模式到对应的%然后复制
  :normal %v%y
  :!emacs -Q -batch -eval '(prin1 (+ 1 1))'
"  :!emacs -Q -batch -eval '(print (+ 1 1))'
  "<C-R>"
endfunc
nnoremap <leader>fv :call Run_elisp()<CR>
