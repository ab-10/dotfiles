#!/usr/bin/env bash

script_parent_dir="$(dirname -- "$(realpath -- "$0")")"

cd $script_parent_dir

sudo apt update
sudo apt dist-upgrade -y

sudo apt install zsh vim tmux curl git -y

# ZSH
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
cp $script_parent_dir/.zshrc ~/


# vim
cp $script_parent_dir/.vimrc ~/

# tmux
cp $script_parent_dir/.tmux.conf ~/

# nvim
# Installs nvim to /opt/nvim-linux-x86_64/bin
curl -LO https://github.com/neovim/neovim/releases/latest/download/nvim-linux-x86_64.tar.gz
sudo rm -rf /opt/nvim
sudo tar -C /opt -xzf nvim-linux-x86_64.tar.gz

ln -s $script_parent_dir/nvim/ $HOME/.config/

sudo apt install ripgrep -y

# Node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
\. "$HOME/.nvm/nvm.sh"
nvm install 22

exit 0
