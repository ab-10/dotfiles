# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"


plugins=(
  git
  tmux
)

# tmux plugin config
export ZSH_TMUX_AUTOSTART=true
export ZSH_TMUX_AUTOQUIT=false

# Tmux aliases 
alias tsync='tmux set synchronize-panes'
alias tsplit='tmux split-window -h && tmux split-window -v'

source $ZSH/oh-my-zsh.sh


export EDITOR='vim'

ZSH_THEME="agnoster"
DEFAULT_USER="seneca"
COMPLETION_WAITING_DOTS="false"

fpath=(~/.zsh.d/ $fpath)
