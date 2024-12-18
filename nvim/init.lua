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

require("lazy").setup({
    "folke/tokyonight.nvim", -- colorscheme
    'tpope/vim-sleuth',
    'tpope/vim-markdown',
    'Vimjas/vim-python-pep8-indent',
    'mfussenegger/nvim-jdtls',
    'bullets-vim/bullets.vim',
    'folke/which-key.nvim',
    'vlime/vlime',
    'zbirenbaum/copilot.lua',
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
        "robitx/gp.nvim",
        config = {
            openai_api_key = { "cat", "/Users/seneca/.openai_key" },
            default_chat_agent = "Claude",
            agents = {
                {
                    name = "ChatGPT3-5",
                    disable = true,
                },
                {
                    name = "GPT-4",
                    provider = "openai",
                    chat = true,
                    command = true,
                    model = { model = "gpt-4" },
                    system_prompt = "You are an intelligent and helpful assistant.",
                },
                {
                    name = "Claude",
                    provider = "anthropic",
                    model = { model = "claude-3-5-sonnet-20241022" },
                    -- secret = { "cat", "/Users/seneca/.anthropic_key" },
                    system_prompt = "You are an intelligent and helpful assistant.",
                    chat = true,
                    command = true,
                },
            },
            providers = {
                anthropic = {
                    endpoint = "https://api.anthropic.com/v1/messages",
                    secret = { "cat", "/Users/seneca/.anthropic_key" },
                },
            }
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
    { -- Highlight, edit, and navigate code
        'nvim-treesitter/nvim-treesitter',
        build = ':TSUpdate',
        opts = {
            ensure_installed = { 'bash', 'c', 'diff', 'html', 'lua', 'luadoc', 'markdown', 'vim', 'vimdoc', 'python', 'yaml'},
            -- Autoinstall languages that are not installed
            auto_install = true,
            highlight = {
                enable = true,
                additional_vim_regex_highlighting = { 'python' },
            },
            indent = { enable = false, disable = { 'python' } },
        },
        config = function (_, opts)
            require('nvim-treesitter.configs').setup(opts)
        end,
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

      },
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


vim.keymap.set('n', '<leader>gn', '<cmd>GpChatNew<cr>', { desc = '[G]P Chat [N]ew' })

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
  lsp_map('<leader>lu', require('telescope.builtin').lsp_references, '[L]SP goto [U]sages')
  lsp_map('<leader>lr', vim.lsp.buf.rename, '[L]SP [R]ename')
  lsp_map('<leader>la', vim.lsp.buf.code_action, '[L]SP Code [A]ction')
end


require('which-key').add({
    { "<leader>b", group = "[b]uffer" },
    { "<leader>f", group = "[F]ile" },
    { "<leader>l", group = "[l]sp" },
    { "<leader>s", group = "[S]earch" },
    { "<leader>t", group = "nvim-[t]ree" },
})

-- [[ LSP config ]]
require('mason').setup()
require('mason-lspconfig').setup()

local servers = {
  html = {},
  pylsp = {
    pylsp = {
        plugins = {
          pycodestyle = {
            ignore = {'W391', 'E'},
            maxLineLength = 100
          }
        }
    }
  },
  jdtls = {}, -- Java language server
}

-- Only show errors in the editor
require('filter-diagnostics').set_level(vim.diagnostic.severity.ERROR)

-- Setup neovim lua configuration
require('neodev').setup()

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

require("copilot").setup({
    suggestion = {
        enabled = true,
        auto_trigger = true,
        hide_during_completion = true,
        debounce = 75,
        keymap = {
            accept_line = "<c-l>",
            accept = false,
            accept_word = false,
            next = "<c-j>",
            prev = "<c-k>",
            toggle = false,
            chat = false,
            command = false,
        },
    },
    filetypes = {
        python = true,
        yaml = true,
    },
})

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
  },

  enabled = function ()
    -- disable completion in comments
    if vim.g.cmpenabled == 0 then
      return false
    end

    local context = require 'cmp.config.context'
    local ftype = vim.api.nvim_buf_get_option(0, 'filetype')

    local disabled_langs = {markdown = true,
                            help = true,
                            gitcommit = true,
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


