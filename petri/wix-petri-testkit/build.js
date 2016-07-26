'use strict';
const spawn = require('child_process').spawnSync;

const nodeVersion = process.version;

if (nodeVersion !== 'v6.2.0') {
  throw new Error('node version in .nvmrc must be set to "6.2.0"');
}

const commands = [
  {name: `testing on node ${nodeVersion}`, exec: 'npm install && npm test && mv node_modules node_modules_backup'},
  {name: 'testing on node 4', exec: 'unset npm_config_prefix; . ~/.nvm/nvm.sh --silent; nvm install 4 && npm install && npm test'},
  {name: `releasing using node ${nodeVersion}`, exec: 'unset npm_config_prefix; . ~/.nvm/nvm.sh --silent; nvm use && rm -rf node_modules && mv node_modules_backup node_modules && npm run release'}
];

commands.forEach(cmd => {
  console.log(`##teamcity[blockOpened name='Executing ${cmd.name}']`);
  spawn('sh', ['-c', cmd.exec], {stdio: 'inherit'});
  console.log(`##teamcity[blockClosed name='Executing ${cmd.name}']`);
});
