
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
(setq-default cursor-type 'bar)
;;关闭自动备份文件
(setq-default make-backup-files nil)
;;c-x 1 单屏
;;c-x 2 下方分屏
;;c-x 3 右方分屏
;;本来说添加了后org里就有语法高亮，不知道为什么添加了没有，后来发现需要在<s 加tab加emacs-lisp结构里
(require 'org)
(setq org-src-fontify-natively t)
(require 'recentf)
;;打开最近文件
(recentf-mode 1)
;;选中词后直接替换
(delete-selection-mode t)
(setq recentf-max-menu-items 25)
;;设置热键
(global-set-key "\C-x\ \C-r" 'recentf-open-files)
;;执行部分c-x c-e
;;执行全部m-x eval-buffer
;;直接全屏
(setq initial-frame-alist (quote ((fullscreen . maximized))))
;;加钩子显示匹配代码
(add-hook 'emacs-lisp-mode-hook 'show-paren-mode)
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

