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
  (insert (format "hello %s!\n" name))
(hello "great")
