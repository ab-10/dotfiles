autocmd BufWritePost silent * !pandoc '%:t' -o '%:r'.pdf
