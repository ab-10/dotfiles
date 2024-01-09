return {
  "f-person/auto-dark-mode.nvim",
  config = {
    update_interval = 100,
    set_dark_mode = function()
      print('darkdady dark')
      vim.api.nvim_set_option("background", "dark")
      vim.cmd("colorscheme solarized")
    end,
    set_light_mode = function()
      print('lightly light')
      vim.api.nvim_set_option("background", "light")
      vim.cmd("colorscheme kanagawa")
    end,
  },
}
