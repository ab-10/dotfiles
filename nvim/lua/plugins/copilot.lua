local config = function()
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
end

return {
    'zbirenbaum/copilot.lua',
    config = config,
}
