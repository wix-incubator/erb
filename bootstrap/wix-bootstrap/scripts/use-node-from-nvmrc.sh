#!/usr/bin/env bash
#
# Script to install node version defined in .nvmrc and replace global node with it.
# Should be executed in app dir once app assets are copied and before npm install.
#
echo 'Replacing node version with the one in .nvmrc'
. ~/.nvm/nvm.sh && nvm install && ln -sf `nvm which current` '/usr/local/bin/node'