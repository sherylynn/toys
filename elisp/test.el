(atom '(atom 'a))
(atom 't)
(atom 'a)
(atom (quote abc))
;;eval模式下,只能选择放弃了单引号,而使用quote
(eq (quote a) (quote b))
(eq (quote a) (quote a))
;;尝试把所有的'转化成(quote)
