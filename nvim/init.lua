vim.o.runtimepath = vim.o.runtimepath .. ',~/.vim' ..  ',~/.vim/after'
vim.o.packpath = vim.o.runtimepath

vim.cmd('source ~/.vimrc')

vim.g.mapleader = ' '
vim.g.maplocalleader = ' '

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

require("lazy").setup({
    -- colorscheme
    "folke/tokyonight.nvim",

    -- plugins
    'tpope/vim-sleuth',
    'Vimjas/vim-python-pep8-indent',
    'mfussenegger/nvim-jdtls',
    {
        'nvim-telescope/telescope.nvim',
        branch = '0.1.x',
        dependencies = {
          'nvim-lua/plenary.nvim',
          {
           'nvim-telescope/telescope-fzf-native.nvim',
            build = 'make',
            cond = function()
              return vim.fn.executable 'make' == 1
            end,
          },
        },
    },

    {
    -- Highlight, edit, and navigate code
    'nvim-treesitter/nvim-treesitter',
    dependencies = {
      'nvim-treesitter/nvim-treesitter-textobjects',
    },
    build = ':TSUpdate',
  },

})

vim.cmd("colorscheme tokyonight")

-- vanila keybindings
vim.keymap.set('n', '<leader>w', '<cmd>write<cr>', { desc = '[W]rite to current file' })
vim.keymap.set('n', '<leader>x', '<cmd>write<cr><cmd>quit<cr>', { desc = '[x] Write and quit' })
vim.keymap.set('n', '<leader>q', '<cmd>quit<cr>', { desc = '[Q]uit' })

-- telescope config
vim.keymap.set('n', '<leader>s/', require('telescope.builtin').live_grep, { desc = '[S]earch [/] in Open Files' })
vim.keymap.set('n', '<leader>ss', require('telescope.builtin').builtin, { desc = '[S]earch [S]elect Telescope' })
vim.keymap.set('n', '<leader>sg', require('telescope.builtin').git_files, { desc = '[S]earch [G]it Files' })
vim.keymap.set('n', '<leader>sf', require('telescope.builtin').find_files, { desc = '[S]earch [F]iles' })




-- treesitter config
vim.defer_fn(function()
  require('nvim-treesitter.configs').setup {
    ensure_installed = { 'lua', 'python', 'markdown', 'markdown_inline' },
    modules = {},
    highlight = { enable = true },
    indent = { enable = true },
  }
end, 0)
