const _ = require('lodash');

const arr = [
  { dir: 'wix-bootstrap-tests',
    fullPath: '/Users/viliusl/Projects/node/server-platform-js/bootstrap/wix-bootstrap-tests',
    relativePath: 'bootstrap/wix-bootstrap-tests',
    npm:
    { name: 'wix-bootstrap-tests',
      version: '1.0.0',
      dependencies: [Object] },
    jvm:
    { name: 'com.wixpress.npm.wix-bootstrap-tests',
      dependencies: {} } },
  { dir: 'wix-bootstrap-tests',
    fullPath: '/Users/viliusl/Projects/node/server-platform-js/bootstrap/wix-bootstrap-tests',
    relativePath: 'bootstrap/wix-bootstrap-tests',
    npm:
    { name: 'wix-bootstrap-tests',
      version: '1.0.0',
      dependencies: [Object] },
    jvm:
    { name: 'com.wixpress.npm.wix-bootstrap-tests',
      dependencies: {} } }
];

console.log(_.uniq(arr, false, 'dir'));