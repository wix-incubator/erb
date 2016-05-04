"use strict";
var child_process = require('child_process');

child_process.spawn('sh', ['-c', 'echo installing && npm install --ignore-scripts && echo building && npm run build && echo testing && npm test && echo releasing && npm run release'],
  {stdio: 'inherit'}).on('close', function (code) {
  if (code) {
    process.exit(code);
  }
});