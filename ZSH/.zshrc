export PATH=$HOME/.local/bin:$HOME/Library/Python/3.9/bin:$PATH
export PATH=/usr/local/bin/:$PATH
export PATH=/usr/local/opt/:$PATH
export PATH=/usr/local/sbin:$PATH

# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"
export DISPLAY=":1"

alias vim=`which nvim`
alias vi="vim"


export PATH="$HOME/.poetry/bin:$PATH"
export PATH="$HOME/.docker/cli-plugins/:$PATH"


source <(fzf --zsh)

plugins=(
  git
  tmux
  direnv
)

# tmux plugin config
export ZSH_TMUX_AUTOSTART=true
export ZSH_TMUX_AUTOQUIT=false

# Tmux aliases 
alias tsync='tmux set synchronize-panes'
alias tsplit='tmux split-window -h && tmux split-window -v'

# Git aliases
alias grp='git grep'


export EDITOR='nvim'

ZSH_THEME="agnoster"
DEFAULT_USER="seneca"


source /usr/local/share/zsh-autosuggestions/zsh-autosuggestions.zsh
COMPLETION_WAITING_DOTS="false"

source $ZSH/oh-my-zsh.sh

fpath=(~/.zsh.d/ $fpath)

# The next line updates PATH for the Google Cloud SDK.
if [ -f '/Users/seneca/Downloads/google-cloud-sdk/path.zsh.inc' ]; then . '/Users/seneca/Downloads/google-cloud-sdk/path.zsh.inc'; fi

# The next line enables shell command completion for gcloud.
if [ -f '/Users/seneca/Downloads/google-cloud-sdk/completion.zsh.inc' ]; then . '/Users/seneca/Downloads/google-cloud-sdk/completion.zsh.inc'; fi

PATH=$PATH:'/usr/local/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/bin/'
export PATH="/usr/local/opt/python@3.10/bin:$PATH"

test -e "${HOME}/.iterm2_shell_integration.zsh" && source "${HOME}/.iterm2_shell_integration.zsh"

export PATH=$HOME/.pyenv/shims/:$PATH
export PATH=$HOME/.pyenv/versions/3.10.4/bin/:$PATH


if command -v rbenv >/dev/null; then
  # make sure to use rbenv's ruby and gem
  export PATH=$(dirname $(rbenv which gem)):$PATH
fi
