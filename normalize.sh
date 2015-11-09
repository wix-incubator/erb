#/bin/bash

echo 'qwe'

# .nvmrc
bidev forall 'printf "4\n" > .nvmrc'

# .npmignore
bidev forall 'printf "test\n" > .npmignore'