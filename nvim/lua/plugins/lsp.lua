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

return {{
    -- Install LSP and friends
    'neovim/nvim-lspconfig',
    dependencies = {
        { 'williamboman/mason.nvim', priority = 100 },
        { 'williamboman/mason-lspconfig.nvim', priority = 90 },
    },
    lazy=false,
    config = function()
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

        require('mason').setup()
        require('mason-lspconfig').setup({
            ensure_installed = vim.tbl_keys(servers),
            automatic_installation = true,
        })


        -- nvim-cmp supports additional completion capabilities, so broadcast that to servers
        local capabilities = vim.lsp.protocol.make_client_capabilities()
        -- capabilities = require('cmp_nvim_lsp').default_capabilities(capabilities)

        -- Ensure the servers above are installed
        local mason_lspconfig = require 'mason-lspconfig'

        mason_lspconfig.setup({
            handlers={
                function(server_name)
                    require('lspconfig')[server_name].setup({
                    capabilities = capabilities,
                    on_attach = on_lsp_attach,
                    settings = servers[server_name],
                    filetypes = (servers[server_name] or {}).filetypes,
                    autostart=true,
                    })
                end
            }
        })
    end
    }
}
