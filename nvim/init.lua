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

    -- plugins_str
    'tpope/vim-sleuth',
    'Vimjas/vim-python-pep8-indent',
    'mfussenegger/nvim-jdtls',
    'folke/which-key.nvim',
    'nvim-tree/nvim-tree.lua',
    'nvim-tree/nvim-web-devicons',
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

    -- Install LSP and friends
    {
      'neovim/nvim-lspconfig',
      dependencies = {
        -- Automatically install LSPs to stdpath for neovim
        { 'williamboman/mason.nvim', config = true },
        'williamboman/mason-lspconfig.nvim',

        -- Useful status updates for LSP
        -- NOTE: `opts = {}` is the same as calling `require('fidget').setup({})`
        { 'j-hui/fidget.nvim', opts = {} },

        -- Additional lua configuration, makes nvim stuff amazing!
        'folke/neodev.nvim',
      },
    },

    {
      -- Autocompletion
      'hrsh7th/nvim-cmp',
      dependencies = {
        -- Snippet Engine & its associated nvim-cmp source
        'L3MON4D3/LuaSnip',
        'saadparwaiz1/cmp_luasnip',

        -- Adds LSP completion capabilities
        'hrsh7th/cmp-nvim-lsp',
        'hrsh7th/cmp-path',

        -- Adds a number of user-friendly snippets
        'rafamadriz/friendly-snippets',
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

-- [[ vanilla config ]]
vim.o.hlsearch = false

-- Save undo history
vim.o.undofile = true

-- Case-insensitive searching UNLESS \C or capital in search
vim.o.ignorecase = true
vim.o.smartcase = true



-- [[ vanila keybindings ]]
vim.keymap.set('n', '<leader>fw', '<cmd>write<cr>', { desc = '[F]ile [W]rite to current file' })
vim.keymap.set('n', '<leader>fx', '<cmd>write<cr><cmd>quit<cr>', { desc = '[F]ile [x] Write and quit' })
vim.keymap.set('n', '<leader>fq', '<cmd>quit<cr>', { desc = '[F]ile [Q]uit' })
vim.keymap.set('n', '<leader>f!q', '<cmd>quit!<cr>', { desc = '[F]ile [Q]uit' })


vim.keymap.set('n', '<leader>bk', '<cmd>bdelete<cr>', { desc = '[B]uffer [K]ill' })
vim.keymap.set('n', '<leader>b[', '<cmd>bprevious<cr>', { desc = '[B]uffer [P]revious' })
vim.keymap.set('n', '<leader>b]', '<cmd>bnext<cr>', { desc = '[B]uffer [N]ext' })

vim.keymap.set('n', '<tab>', 'za', { desc = 'Toggle fold' })

-- [[ telescope config ]]
vim.keymap.set('n', '<leader>s/', require('telescope.builtin').live_grep, { desc = '[S]earch [/] in Open Files' })
vim.keymap.set('n', '<leader>ss', require('telescope.builtin').builtin, { desc = '[S]earch [S]elect Telescope' })
vim.keymap.set('n', '<leader>sg', require('telescope.builtin').git_files, { desc = '[S]earch [G]it Files' })
vim.keymap.set('n', '<leader>sf', require('telescope.builtin').find_files, { desc = '[S]earch [F]iles' })

-- [ lsp powered bindings ]]
local on_lsp_attach = function (_, bufnr)

  local lsp_map = function(keys, func, desc)
    if desc then
      desc = 'LSP: ' .. desc
    end

    vim.keymap.set('n', keys, func, { buffer = bufnr, desc = desc })
  end

  lsp_map('<leader>ld', require('telescope.builtin').lsp_definitions, '[L]SP goto [D]efinition')
end


-- [[ nvim-tree keybindings ]]
local find_current = function ()
  require('nvim-tree.api').tree.toggle({find_file=true})
end

vim.keymap.set('n', '<leader>t', find_current, { desc = 'nvim-[T]ree [F]iles' })

require('which-key').register({
  ['<leader>s'] = { name = '[S]earch', _ = 'which_key_ignore' },
  ['<leader>f'] = { name = '[F]ile', _ = 'which_key_ignore' },
  ['<leader>t'] = { name = 'nvim-[t]ree', _ = 'which_key_ignore' },
  ['<leader>l'] = { name = '[l]sp', _ = 'which_key_ignore' },
  ['<leader>b'] = { name = '[b]uffer', _ = 'which_key_ignore' },

})

-- [[ treesitter config ]]
vim.defer_fn(function()
  require('nvim-treesitter.configs').setup {
    ensure_installed = { 'c', 'lua', 'vim', 'vimdoc', 'query', 'python', -- mandatory
                        'markdown', 'markdown_inline', 'html', 'scss'},
    modules = {},
    highlight = { enable = true },
    indent = { enable = true },
    auto_install = true,
    sync_install = false,
    ignore_install = {},
  }
end, 0)

-- [[ LSP config ]]
require('mason').setup()
require('mason-lspconfig').setup()

-- Enable the following language servers
--  Feel free to add/remove any LSPs that you want here. They will automatically be installed.
--
--  Add any additional override configuration in the following tables. They will be passed to
--  the `settings` field of the server config. You must look up that documentation yourself.
--
--  If you want to override the default filetypes that your language server will attach to you can
--  define the property 'filetypes' to the map in question.
local servers = {
  -- clangd = {},
  -- gopls = {},
  -- pyright = {},
  -- rust_analyzer = {},
  -- tsserver = {},
  html = {},
  jedi_language_server = {},

  --[[
  lua_ls = {
    Lua = {
      workspace = { checkThirdParty = false },
      telemetry = { enable = false },
      -- NOTE: toggle below to ignore Lua_LS's noisy `missing-fields` warnings
      -- diagnostics = { disable = { 'missing-fields' } },
    },
  },
  ]]--
}

-- Setup neovim lua configuration
require('neodev').setup()

-- [[ nvim-tree ]]
require('nvim-tree').setup()

-- nvim-cmp supports additional completion capabilities, so broadcast that to servers
local capabilities = vim.lsp.protocol.make_client_capabilities()
capabilities = require('cmp_nvim_lsp').default_capabilities(capabilities)

-- Ensure the servers above are installed
local mason_lspconfig = require 'mason-lspconfig'

mason_lspconfig.setup {
  ensure_installed = vim.tbl_keys(servers),
}

mason_lspconfig.setup_handlers {
  function(server_name)
    require('lspconfig')[server_name].setup {
      capabilities = capabilities,
      on_attach = on_lsp_attach,
      settings = servers[server_name],
      filetypes = (servers[server_name] or {}).filetypes,
    }
  end,
}

-- [[ Configure nvim-cmp ]]
-- See `:help cmp`
local cmp = require 'cmp'
local luasnip = require 'luasnip'
require('luasnip.loaders.from_vscode').lazy_load()
luasnip.config.setup {}

cmp.setup {
  snippet = {
    expand = function(args)
      luasnip.lsp_expand(args.body)
    end,
  },
  completion = {
    completeopt = 'menu,menuone,noinsert',
  },
  mapping = cmp.mapping.preset.insert {
    ['<C-k>'] = cmp.mapping.select_prev_item(),
    ['<C-j>'] = cmp.mapping.select_next_item(),
    ['<C-b>'] = cmp.mapping.scroll_docs(-4),
    ['<C-f>'] = cmp.mapping.scroll_docs(4),
    ['<C-Space>'] = cmp.mapping.complete {},
    ['<CR>'] = cmp.mapping.confirm {
      behavior = cmp.ConfirmBehavior.Replace,
      select = true,
    },
    ['<Tab>'] = cmp.mapping(function(fallback)
      if cmp.visible() then
        cmp.select_next_item()
      elseif luasnip.expand_or_locally_jumpable() then
        luasnip.expand_or_jump()
      else
        fallback()
      end
    end, { 'i', 's' }),
    ['<S-Tab>'] = cmp.mapping(function(fallback)
      if cmp.visible() then
        cmp.select_prev_item()
      elseif luasnip.locally_jumpable(-1) then
        luasnip.jump(-1)
      else
        fallback()
      end
    end, { 'i', 's' }),
  },
  sources = {
    { name = 'nvim_lsp' },
    { name = 'luasnip' },
    { name = 'path' },
  },

  enabled = function ()
    -- disable completion in comments
    local context = require 'cmp.config.context'
    local ftype = vim.api.nvim_buf_get_option(0, 'filetype')

    local disabled_langs = {markdown = true,
                            help = true
                            }

    if disabled_langs[ftype] then
      return false
    -- keep command mode completion enabled when cursor is in a comment
    elseif vim.api.nvim_get_mode().mode == 'c' then
      return true
    else
      return not context.in_treesitter_capture("comment") and not context.in_syntax_group("Comment")
    end
  end
}
