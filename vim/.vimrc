" execute pathogen#infect()
syntax enable
filetype plugin indent on
filetype plugin on

set backspace=indent,eol,start  " when this is removed some vim versions won't allow backspacing past the three options here

set spell spelllang=en_gb
" hi SpellBad guibg=#ff2929 ctermbg=224

let g:pymode_doc_bind = 'H'

let g:jedi#completions_command = "<leader>c"
set splitbelow
let g:jedi#show_call_signatures = "0"


set relativenumber
set nu rnu

:let mapleader=","

let g:pymode_folding=0

map <F1> :NERDTreeToggle<CR>

" turn off search highlight
nnoremap <leader><space> :nohlsearch<CR>

" Open vertical split
map <leader><w> <C-w>
map <C-j> :split <CR>
map <C-l> :vsplit <CR>

" Efficient escape
:imap jj <Esc>

" easier saving
map <C-c> <esc>:w<CR>
map <C-x> <esc>:x<CR>
map <C-e> <esc>:q!<CR>

" sort selected lines
vnoremap <leader>s :sort<CR>

" highlight current line
set cursorline

" show line to avoid lines too long
" set colorcolumn=80

" tab length configuration
set tabstop=4 shiftwidth=4 expandtab
:set autoindent
filetype indent plugin on
"set clipboard=unnamedplus,unnamed

" easier indentation
vnoremap < <gv
vnoremap > >gv

" settings for writing prose
nmap <F2>  :PencilSoft <CR>

let g:airline_powerline_fonts = 1
set t_Co=256
let g:airline_theme='solarized'
let g:airline_solarized_bg='dark'

" let ropevim_vim_completion=1
let g:pymode_doc = 1
let g:jedi#documentation_command = "<leader>h"
map <C-space> :RopeCodeAssist

" easier movement between splits
map <S-j> <esc>:wincmd j<CR>
map <S-k> <esc>:wincmd k<CR>
map <S-h> <esc>:wincmd h<CR>
map <S-l> <esc>:wincmd l<CR>

" jump between matching html tags with %
runtime macros/matchit.vim
