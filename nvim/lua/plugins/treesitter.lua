return {{ -- Highlight, edit, and navigate code
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
    }
}
