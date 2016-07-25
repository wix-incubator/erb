'use strict';
const spawn = require('child_process').spawnSync;

module.exports = () => {
  const phases = [
    'npm run test',
    'unset npm_config_prefix; . ~/.nvm/nvm.sh --silent; nvm install 4 && npm test',
    'unset npm_config_prefix; . ~/.nvm/nvm.sh --silent; nvm use && npm run release'
  ];

  phases.forEach(command => {
    console.log(`##teamcity[blockOpened name='Executing ${command}']`);
    spawn('sh', ['-c', command], {stdio: 'inherit'});
    console.log(`##teamcity[blockClosed name='Executing ${command}']`);
  });
};