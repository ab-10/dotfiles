local M = {}

local orig_diag_virt_handler = vim.diagnostic.handlers.virtual_text
local ns = vim.api.nvim_create_namespace("my_diagnostics")

local filter_diagnostics = function(diagnostics, level)
    local filtered_diag = {}
    for _, d in ipairs(diagnostics) do
        if d.severity <= level then
            table.insert(filtered_diag, 1, d)
        end
    end
    return filtered_diag
end

M.set_level = function(level)

    -- hide all diagnostics
    vim.diagnostic.hide(nil, 0) 

    -- vim.diagnostic.reset()
    vim.diagnostic.handlers.virtual_text = {
        show = function(_, bufnr, _, opts)
            -- get all diagnostics for local buffer
            local diagnostics = vim.diagnostic.get(bufnr)
            filtered = filter_diagnostics(diagnostics, level)
            -- filter diags based on severity
            orig_diag_virt_handler.show(ns, bufnr, filtered, opts)
        end,
        hide = function(_, bufnr)
            orig_diag_virt_handler.hide(ns, bufnr)
        end
    }

    --[[
    vim.diagnostic.handlers.signs = {
      show = function(_, bufnr, _, opts)
        -- Get all diagnostics from the whole buffer rather than just the
        -- diagnostics passed to the handler
        local diagnostics = vim.diagnostic.get(bufnr)

        -- Find the "worst" diagnostic per line
        local max_severity_per_line = {}
        for _, d in pairs(diagnostics) do
          local m = max_severity_per_line[d.lnum]
          if not m or d.severity < m.severity then
            max_severity_per_line[d.lnum] = d
          end
        end

        -- Pass the filtered diagnostics (with our custom namespace) to
        -- the original handler
        local filtered_diagnostics = vim.tbl_values(max_severity_per_line)
        orig_signs_handler.show(ns, bufnr, filtered_diagnostics, opts)
      end,
      hide = function(_, bufnr)
        orig_signs_handler.hide(ns, bufnr)
      end,
    }
    ]]

    bufnr = vim.api.nvim_get_current_buf()
    local diags = vim.diagnostic.get(bufnr)
    if #diags > 0 then
        filtered = filter_diagnostics(diags, level)
        vim.diagnostic.show(ns, bufnr, filtered)
    end
end

return M
