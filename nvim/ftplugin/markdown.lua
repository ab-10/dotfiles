_G.md_foldexpr = function ()
    local line = vim.fn.getline(vim.v.lnum)
    local header_level = vim.fn.matchstr(line, '^#*')

    if #header_level == 1 then
        return ">" .. tostring(#header_level)
    end

    return "="
end


local vim = vim
vim.opt.foldmethod = "expr"
vim.opt.foldexpr = "v:lua.md_foldexpr()"

vim.cmd("set foldenable")

vim.keymap.set('n', '<leader>mf', '<cmd>RenumberList<cr>', { desc = '[M]arkdown [F]ix list' })
