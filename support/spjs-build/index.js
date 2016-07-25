'use strict';
const spawn = require('child_process').spawnSync;

const nodeVersion = '6.2.0';

module.exports = () => {
  const phases = [
    'npm run test && rm -rf node_modules',
    `unset npm_config_prefix; . ~/.nvm/nvm.sh --silent; nvm install ${nodeVersion} && nvm use ${nodeVersion} && npm install && npm test && npm run release`
  ];

  phases.forEach(command => {
    console.log(`##teamcity[blockOpened name='Executing ${command}']`);
    spawn('sh', ['-c', command], {stdio: 'inherit'});
    console.log(`##teamcity[blockClosed name='Executing ${command}']`);
  });
};