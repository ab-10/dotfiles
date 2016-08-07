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
sudo dnf install zsh
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
Install Pathogen
```
mkdir -p ~/.vim/autoload ~/.vim/bundle && \
curl -LSso ~/.vim/autoload/pathogen.vim https://tpo.pe/pathogen.vim
```
Place `.vimrc` in your home folder
```
cp ~/dotfiles/vim/.vimrc ~
```
Install Solarized color scheme
```
cd ~/.vim/bundle && \
git clone https://github.com/altercation/vim-colors-solarized.git
```
Install SnipMate
```
cd ~/.vim/bundle &&\
git clone https://github.com/tomtom/tlib_vim.git &&\
git clone https://github.com/MarcWeber/vim-addon-mw-utils.git &&\
git clone https://github.com/garbas/vim-snipmate.git
```
Copy snippets
```
cp ~/dotfiles/vim/snippets/java.snippets ~/.vim/snippets
```
Install vim pencil
```
cd ~/.vim/bundle && \
git clone https://github.com/reedes/vim-pencil.git
```
Install Goyo
```
cd ~/.vim/bundle && \
git clone https://github.com/junegunn/goyo.vim.git
```
