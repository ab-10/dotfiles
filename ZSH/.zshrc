export ZSH=/home/arminbagrat/.oh-my-zsh

ZSH_THEME="agnoster"

DEFAULT_USER="arminbagrat"

COMPLETION_WAITING_DOTS="false"

plugins=(git)

source $ZSH/oh-my-zsh.sh

alias mkpass="pwgen -c -n -y"

. /home/arminbagrat/torch/install/bin/torch-activate
