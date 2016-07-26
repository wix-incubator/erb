'use strict';
const spawn = require('child_process').spawnSync;

const commands = [
  {name: `test on node ${process.version}`, exec: 'npm install && npm test && mv node_modules node_modules_backup'},
  {name: 'test on node 4', exec: 'unset npm_config_prefix; . ~/.nvm/nvm.sh --silent; nvm install 4 && npm install && npm test'},
  {name: `release using node ${process.version}`, exec: 'unset npm_config_prefix; . ~/.nvm/nvm.sh --silent; nvm use && rm -rf node_modules && mv node_modules_backup node_modules && npm run release'}
];

commands.forEach(cmd => {
  console.log(`##teamcity[blockOpened name='Executing ${cmd.name}']`);
  spawn('sh', ['-c', cmd.exec], {stdio: 'inherit'});
  console.log(`##teamcity[blockClosed name='Executing ${cmd.name}']`);
});
