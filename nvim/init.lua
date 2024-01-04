vim.o.runtimepath = vim.o.runtimepath .. ',~/.vim' ..  ',~/.vim/after'
vim.o.packpath = vim.o.runtimepath

vim.cmd('source ~/.vimrc')

require("plugins")
