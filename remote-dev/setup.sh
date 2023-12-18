#!/usr/bin/env bash

script_parent_dir="$(dirname -- "$(realpath -- "$0")")"

cd $script_parent_dir

sudo apt update
sudo apt dist-upgrade

sudo apt install zsh vim tmux curl git -y

# ZSH
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
cp $script_parent_dir/.zshrc ~/


# vim
cp $script_parent_dir/.vimrc ~/

# tmux
cp $script_parent_dir/.tmux.conf ~/

exit 0
