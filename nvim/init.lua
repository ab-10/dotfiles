vim.o.runtimepath = vim.o.runtimepath .. ',~/.vim' ..  ',~/.vim/after'
vim.o.packpath = vim.o.runtimepath

vim.cmd('source ~/.vimrc')
vim.opt.clipboard:append('unnamedplus')

vim.g.cmpenabled = 1
vim.g.mapleader = ' '
vim.g.maplocalleader = ' '

vim.opt.autoindent = true
vim.opt.smartindent = true
vim.opt.shiftround = true
vim.opt.shiftwidth = 0

vim.filetype.add({
    extension = {mdx = 'markdown'},
})

-- Set up lazyvim
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable", -- latest stable release
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

require("lazy").setup("plugins")

vim.cmd("colorscheme tokyonight")

vim.o.hlsearch = false

-- Save undo history
vim.o.undofile = true

-- Case-insensitive searching UNLESS \C or capital in search
vim.o.ignorecase = true
vim.o.smartcase = true

-- [[ keybindings ]]
require('which-key').add({
    { "<leader>b", group = "[b]uffer" },
    { "<leader>f", group = "[F]ile" },
    { "<leader>l", group = "[l]sp" }, -- bindings configured in lsp.lua
    { "<leader>s", group = "[S]earch" },
    { "<leader>t", group = "nvim-[t]ree" },
    { "<leader>g", group = "[G]pAgent" },
    { "<leader>d", group = "[D]iff" },
})

-- [[ buffer ]]
vim.keymap.set('n', '<leader>bk', '<cmd>bdelete<cr>', { desc = '[B]uffer [K]ill' })
vim.keymap.set('n', '<leader>b[', '<cmd>bprevious<cr>', { desc = '[B]uffer [P]revious' })
vim.keymap.set('n', '<leader>b]', '<cmd>bnext<cr>', { desc = '[B]uffer [N]ext' })

-- [[ file ]]
vim.keymap.set('n', '<leader>fw', '<cmd>write<cr>', { desc = '[F]ile [W]rite to current file' })
vim.keymap.set('n', '<leader>fx', '<cmd>wqa<cr>', { desc = '[F]ile [x] Write and quit' })
vim.keymap.set('n', '<leader>fq', '<cmd>quit<cr>', { desc = '[F]ile [Q]uit' })
vim.keymap.set('n', '<leader>f!q', '<cmd>quit!<cr>', { desc = '[F]ile [Q]uit' })



vim.keymap.set('n', '<tab>', 'za', { desc = 'Toggle fold' })


-- [[ GpAgent ]]
vim.keymap.set('n', '<leader>gn', '<cmd>GpChatNew<cr>', { desc = '[G]P Chat [N]ew' })
vim.keymap.set('n', '<leader>gc', '<cmd>GpCodeQuery<cr>', { desc = '[G]P [C]ode query' })
vim.keymap.set('n', '<leader>gs', '<cmd>GpStop<cr>', { desc = '[G]P [S]top' })
vim.keymap.set('n', '<leader>g<return>', '<cmd>GpChatRespond<cr>', { desc = '[G]P Chat Respond' })
vim.keymap.set('n', '<leader>gc<return>', '<cmd>GpCodeQuery<cr>', { desc = '[G]P [C]ode Query' })

-- [[ search (telescope) ]]
vim.keymap.set('n', '<leader>s/', require('telescope.builtin').live_grep, { desc = '[S]earch [/] in Open Files' })
vim.keymap.set('n', '<leader>ss', require('telescope.builtin').builtin, { desc = '[S]earch [S]elect Telescope' })
vim.keymap.set('n', '<leader>sg', require('telescope.builtin').git_files, { desc = '[S]earch [G]it Files' })
vim.keymap.set('n', '<leader>sf', require('telescope.builtin').find_files, { desc = '[S]earch [F]iles' })

-- [[ git ]]
vim.keymap.set('n', '<leader>do', '<cmd>diffget LOCAL<cr>', { desc = '[D]iff get [O]urs' })
vim.keymap.set('n', '<leader>dt', '<cmd>diffget REMOTE<cr>', { desc = '[D]iff get [T]heirs' })
vim.keymap.set('n', '<leader>dn', '/^<<<<<<<\\|^=======\\|^>>>>>>><cr>', { desc = '[D]iff [n]ext conflict' })
vim.keymap.set('n', '<leader>dN', '?^<<<<<<<\\|^=======\\|^>>>>>>><cr>', { desc = '[D]iff ([N]) previous coflict' })
