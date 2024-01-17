local vim = vim

vim.opt.foldmethod = "expr"
vim.opt.foldexpr = "nvim_treesitter#foldexpr()"

vim.cmd("set nofoldenable")

-- local cmp = require('cmp')
-- cmp.setup.buffer({ enabled = false })
