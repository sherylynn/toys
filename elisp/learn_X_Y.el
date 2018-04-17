(+ 2 2)
;;C+j insert result
;;C+x C+e display result
;;C+x C+s write to file
(+ 2 (* 3 4))
;;C+g same to ESC in vim
;;C+h t open tutorial
(setq my-name "lynn")
;;C+/ undo
;;C+s search forward vim:/ C+r search backward vim:?
;;C+r in bash
(insert "hello!")
(insert "hello, I am " my-name)
(defun hello () (insert "hello , I am " my-name))
(hello)
(defun hello (name) (insert "hello" name))
(hello "you")
(switch-to-buffer-other-window "*test*")
(progn
  (switch-to-buffer-other-window "*test*")
  (hello "you"))
;;let me think of vim. vim can toggle a new buffer and show thing new
(progn
  (switch-to-buffer-other-window "*test*")
  (erase-buffer)
  (hello "there"))
(progn
  (switch-to-buffer-other-window "*test*")
  (erase-buffer)
  (hello "you")
  (other-window 1))
(let ((local-name "local"))
  (switch-to-buffer-other-window "*test*")
  (erase-buffer)
  (hello local-name)
  (other-window 1))
;;other-windows change *test* to a real message window. because cursor will back
(format "hello %s!\n" "visitor")

(defun hello (name)
  (insert (format "hello %s!\n" name)))
(hello "great")
(defun greating (name)
  (let ((your-name "lynn"))
    (insert (format "hello %s!\n\nI am %s"
                    name
                    your-name
                    ))))
(defun  greeting (from-name)
  (let ((your-name (read-from-minibuffer "Enter your name ")))
    (insert (format "hello \n\nI am %s and you are %s"
                    from-name
                    your-name
                    ))))
(greeting "lynn")
(defun greating (from-name)
  (let ((your-name (read-from-minibuffer "Enter your name: ")))
    (switch-to-buffer-other-window "*message*")
    (insert (format "hello %s!\n\nI am %s"
                    from-name
                    your-name
                    ))
    (other-window 1)
    ))
(greating "master")
;;lisp can very easy to achieve new feature
(setq list-of-names '("Tom" "lynn" "sherylynn"))
(car list-of-names)
(cdr list-of-names)
(push "sherython" list-of-names)
(mapcar 'hello list-of-names)
;;强悍的lisp开始展露出来
(defun greeting ()
  (switch-to-buffer-other-window "*test*")
  (erase-buffer)
  (mapcar 'hello list-of-names)
  (other-window 1))
(greeting)
(defun replace-hello-by-bonjour ()
  (switch-to-buffer-other-window "*test*")
  (goto-char (point-min))
  (while (search-forward "hello")
    (replace-match "bonjour"))
  (other-window 1))
(replace-hello-by-bonjour)
(defun hello-to-bonjour ()
  (switch-to-buffer-other-window "*test*")
  (erase-buffer)
  (mapcar 'hello list-of-names)
  (goto-char (point-min))
  (while (search-forward "hello" nil 't)
    (replace-match "bonjour"))
  (other-window 1))
(hello-to-bonjour)
(defun boldify-names ()
  (switch-to-buffer-other-window "*test*")
  (goto-char (point-min))
  (while (re-search-forward "bonjour \\(.+\\)!" nil 't)
    (add-text-properties (match-beginning 1)
                         (match-end 1)
                         (list 'face 'bold)))
  (other-widow 1))
(boldify-names)
;;-----------------------------------------
(defun show-hello-world ()
  (interactive);;交互式函数
  (switch-to-buffer-other-window "*message*")
  (erase-buffer)
  (insert "hello world")
  (other-window 1))
(show-hello-world)
(global-set-key (kbd "<f2>") 'show-hello-world);;简单的绑定了按键
(defun define (fuck)
  (defun 'fuck ()
    (message "1")))
(define fuck_you ())
(defun yes (a b)
  (insert a)
  (insert b))
(yes 1 2)
(a)
