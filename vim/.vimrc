execute pathogen#infect()
syntax on
filetype plugin indent on


set background=dark
colorscheme solarized


set relativenumber

" tab length configuration
set tabstop=4 softtabstop=4 shiftwidth=4 noexpandtab

" settings for writing prose
map <f12> :Goyo x50<bar> :TogglePencil <CR>
map <f5>  :setlocal spell! spelllang=en_us <CR>

let g:pencil#wrapModeDefault = 'soft'
