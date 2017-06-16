#!/usr/bin/env bash

export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh";

if [ -f .nvmrc ];then
   echo "Running nvm install $(cat .nvmrc)"
   nvm install &> /dev/null || exit 1
   echo "Now using node $(node -v) (npm v$(npm -v))"
fi

IMAGE_NAME=docker-repo.wixpress.com/com.wixpress.npm.das-boot-ng:snapshot npm run test-image
