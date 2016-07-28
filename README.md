# dotfiles
## Installation
Clone repository to your home folder (if using location other than ~ adjust further commands accordingly)
```
cd ~
git clone https://github.com/ab-10/dotfiles.git
```

### ZSH
Install ZSH through your packet manager

**For Fedora**
```
sudo dnf install
```
Set ZSH as default shell
```
chsh -s $(which zsh)
```
Install Oh My ZSH
```
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```
Copy `.zshrc` to home dir
```
cp ~/dotfiles/ZSH/.zshrc ~
``` 
### VIM
Place `.vimrc` to your home folder
```
cp ~/dotfiles/vim/.vimrc ~
```
Clone packages to `.vim/bundle`
```
cd ~/.vim/bundle && \
git clone https://github.com/altercation/vim-colors-solarized.git && \
git clone https://github.com/SirVer/ultisnips.git
``` 
