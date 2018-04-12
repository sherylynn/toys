
;; Added by Package.el.  This must come before configurations of
;; installed packages.  Don't delete this line.  If you don't want it,
;; just comment it out by adding a semicolon to the start of the line.
;; You may delete these explanatory comments.
(package-initialize)

(tool-bar-mode -1)
(scroll-bar-mode -1)
;;打开数字
(linum-mode 1)
;;关闭启动的欢迎界面
(setq inhibit-splash-screen t)
;;以后把vim的打开自己的文件的editvimcode也改名成这样
(defun open-my-init-file ()
  (interactive)
  (find-file "~/.emacs.d/init.el"))
;;c-h k 查找c-x c-f用的函数
(global-set-key (kbd "<f2>") 'open-my-init-file)
;;--------------------------------------------------------
;;option-manage emacs packages-company install
;;目录在.emacs.d/elpa下
;;M-x company-mode
;;打开全局的commpany-mode
(global-company-mode t)
;;打开全局的数字模式
(global-linum-mode t)
;;改变光标成细条
(setq cursor-type 'bar)
(custom-set-variables
 ;; custom-set-variables was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 '(package-selected-packages (quote (company evil-unimpaired))))
(custom-set-faces
 ;; custom-set-faces was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 )
