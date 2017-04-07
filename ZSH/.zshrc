export ZSH=/home/sartre/.oh-my-zsh

ZSH_THEME="agnoster"

DEFAULT_USER="sartre"

COMPLETION_WAITING_DOTS="false"

plugins=(git)

source $ZSH/oh-my-zsh.sh

alias mkpass="pwgen -c -n -y"

. /home/sartre/torch/install/bin/torch-activate
