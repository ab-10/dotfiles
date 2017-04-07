execute pathogen#infect()
syntax on
filetype plugin indent on

let g:pymode_rope = 0


colorscheme monokai

set relativenumber

map <F3> :NERDTreeToggle<CR>

:let mapleader=","

let g:pymode_folding=0

" turn off search highlight
nnoremap <leader><space> :nohlsearch<CR>

" easier movement between splits
map <S-j> <esc>:wincmd j<CR>
map <S-k> <esc>:wincmd k<CR>
map <S-h> <esc>:wincmd h<CR>
map <S-l> <esc>:wincmd l<CR>

" easier movement between tabs
map <C-h> <esc>:tabprevious<CR>
map <C-l> <esc>:tabnext<CR>
map <C-j> <esc>:tabclose<CR>
map <C-k> <esc>:tabnew<CR>

" easier saving
map <C-c> <esc>:w<CR>
map <C-x> <esc>:x<CR>
map <C-e> <esc>:q!<CR>

" sort selected lines
vnoremap <leader>s :sort<CR>

" highlight current line
set cursorline

" show line to avoid lines too long
set colorcolumn=80
highlight ColorColumn guibg=LightSeaGreen

" tab length configuration
set tabstop=4 shiftwidth=4 expandtab
:set autoindent
filetype indent plugin on

" easier intendation
vnoremap < <gv
vnoremap > >gv

" settings for writing prose
map <f12> :Goyo x80<bar> :TogglePencil <CR>
map <f5>  :setlocal spell! spelllang=en_us <CR>

let g:pencil#wrapModeDefault = 'soft'

" redraw only when necessary
set lazyredraw
