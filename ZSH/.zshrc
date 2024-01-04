export PATH=$HOME/.local/bin:$HOME/Library/Python/3.9/bin:$PATH
export PATH=$HOME/.gem/ruby/2.7.0/bin:$PATH
export PATH=/usr/local/opt/grep/libexec/gnubin:$PATH
export PATH=/usr/local/opt/ccache/libexec:$PATH
export PATH=/usr/local/sbin:$PATH

export PATH="$HOME/.jenv/bin:$PATH"
eval "$(jenv init -)"

# cpp library fix
export PATH="/usr/local/opt/icu4c/bin:$PATH"
export PATH="/usr/local/opt/icu4c/sbin:$PATH"
export PATH="/usr/local/opt/llvm/bin:$PATH"

export LDFLAGS="-L/usr/local/opt/icu4c/lib -L/usr/local/opt/llvm/lib"
export CPPFLAGS="-I/usr/local/opt/icu4c/include -I/usr/local/opt/llvm/include"
export PKG_CONFIG_PATH="/usr/local/opt/icu4c/lib/pkgconfig"


export MESASDK_ROOT=/Applications/mesasdk
source $MESASDK_ROOT/bin/mesasdk_init.sh


# Make sure rbenv ruby updates
# export RUBY_CONFIGURE_OPTS="--with-openssl-dir=$(brew --prefix openssl@1.1)"
# Lead rbenv env
eval "$(rbenv init -)"


# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"
export DISPLAY=":1"

alias vim='/usr/local/bin/nvim'


export PATH="/Users/seneca/.poetry/bin:$PATH"

plugins=(
  git
  tmux
  poetry
)

# Poetry config
padd() {
    poetry add "$1=*"
}

# tmux plugin config

export ZSH_TMUX_AUTOSTART=true
export ZSH_TMUX_AUTOQUIT=false

# Tmux aliases 
alias tsync='tmux set synchronize-panes'
alias tsplit='tmux split-window -h && tmux split-window -v'

source $ZSH/oh-my-zsh.sh

export EDITOR='nvim'

ZSH_THEME="agnoster"

# if [[ $IDE -eq 0 ]] && command -v tmux &> /dev/null && [ -z "$TMUX" ]; then
#     tmux attach -t default || tmux new -s default
# fi

DEFAULT_USER="Lucius Annaeus Seneca"

COMPLETION_WAITING_DOTS="false"

plugins=(git)

source $ZSH/oh-my-zsh.sh

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

export BETTER_EXCEPTIONS=1
fpath=(~/.zsh.d/ $fpath)

# The next line updates PATH for the Google Cloud SDK.
if [ -f '/Users/seneca/Downloads/google-cloud-sdk/path.zsh.inc' ]; then . '/Users/seneca/Downloads/google-cloud-sdk/path.zsh.inc'; fi

# The next line enables shell command completion for gcloud.
if [ -f '/Users/seneca/Downloads/google-cloud-sdk/completion.zsh.inc' ]; then . '/Users/seneca/Downloads/google-cloud-sdk/completion.zsh.inc'; fi

eval "$(direnv hook zsh)"
PATH='/usr/local/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/bin/':$PATH
export PATH="/usr/local/opt/python@3.10/bin:$PATH"

test -e "${HOME}/.iterm2_shell_integration.zsh" && source "${HOME}/.iterm2_shell_integration.zsh"

export PATH=$HOME/.pyenv/shims/:$PATH
export PATH=$HOME/.pyenv/versions/3.10.4/bin/:$PATH

# TODO: fix it so it only appears once per day
# $HOME/last_sunday.sh 1998-08-05 Armin
