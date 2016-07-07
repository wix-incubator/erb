"use strict";
var child_process = require('child_process');

child_process.spawn('sh', ['-c', 'echo cleaning && npm cache clear && rm -rf node_modules && rm -rf npm-shrinkwrap.json && echo installing && npm install && echo building && npm run build && echo testing && npm test && echo releasing && npm prune && npm run release'],
  {stdio: 'inherit'}).on('close', function (code) {
  if (code) {
    process.exit(code);
  }
});