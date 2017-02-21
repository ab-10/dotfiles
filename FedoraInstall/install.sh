#!/bin/bash

sudo dnf update -y
sudo dnf install dconf-cli -y

# configure VIM
sudo dnf install vim -y
mkdir -p ~/.vim/autoload ~/.vim/bundle
curl -LSso ~/.vim/autoload/pathogen.vim https://tpo.pe/pathogen.vim
cp vim/.vimrc ~/
cd ~/.vim/bundle
git clone https://github.com/altercation/vim-colors-solarized.git # install Solarized colorscheme
git clone https://github.com/reedes/vim-pencil.git # install vim pencil
git clone https://github.com/junegunn/goyo.vim.git # install Goyo

# install SnipMate and dependencies
git clone https://github.com/tomtom/tlib_vim.git
git clone https://github.com/MarcWeber/vim-addon-mw-utils.git
git clone https://github.com/garbas/vim-snipmate.git

# tools for note taking using LaTex
sudo dnf install pandoc -y
sudo dnf install texlive -y

# install YouCompleteMe
sudo dnf install automake gcc gcc-c++ kernel-devel cmake python-devel python3-devel -y
git clone https://github.com/Valloric/YouCompleteMe
git submodule update --init --recursive
./install.py --all

# configure terminal
sudo dnf install zsh -y
sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
cd ..
cp ZSH/.zshrc ~/
git clone https://github.com/Anthony25/gnome-terminal-colors-solarized.git
cd gnome-terminal-colors-solarized
./install.sh -s dark
cd ..
sudo rm -rf gnome-terminal-colors-solarzed
