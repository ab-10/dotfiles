syntax enable
filetype plugin indent on
filetype plugin on

set backspace=indent,eol,start  " when this is removed some vim versions won't allow backspacing past the three options here

set spell spelllang=en_gb
hi SpellBad guibg=#ff2929 ctermbg=224

set splitbelow


set relativenumber
set nu rnu

:let mapleader=","

" turn off search highlight
nnoremap <leader><space> :nohlsearch<CR>

" Open vertical split
map <leader><w> <C-w>
map <C-j> :split <CR>
map <C-l> :vsplit <CR>

" easier saving
map <C-c> <esc>:w<CR>
map <C-x> <esc>:x<CR>
map <C-e> <esc>:q!<CR>

" sort selected lines
vnoremap <leader>s :sort<CR>

" highlight current line
set cursorline

" tab length configuration
set tabstop=4 shiftwidth=4 expandtab
:set autoindent
filetype indent plugin on
set clipboard=unnamedplus,unnamed

" easier indentation
vnoremap < <gv
vnoremap > >gv

" easier movement between splits
map <S-j> <esc>:wincmd j<CR>
map <S-k> <esc>:wincmd k<CR>
map <S-h> <esc>:wincmd h<CR>
map <S-l> <esc>:wincmd l<CR>

" jump between matching html tags with %
runtime macros/matchit.vim
