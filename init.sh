#!/usr/bin/env bash

echo "Installing node defined in .nvmrc using nvm"
unset npm_config_prefix && . ~/.nvm/nvm.sh --silent && nvm install
echo "Installing correct version of npm"
npm install -g npm@3.10.8
echo "Building and linking octopus-cli"
sh -c "cd support/octopus-cli && npm install && npm link"

echo ""
echo "Now do nvm use and run 'octo' to build"
