'use strict';
const fs = require('fs'),
  join = require('path').join,
  log = require('wix-logger').get('app-info');

let packageJson;

module.exports = appDir => {
  if (packageJson) {
    return packageJson;
  }

  try {
    packageJson = JSON.parse(fs.readFileSync(join(appDir, 'package.json')).toString());
  } catch (e) {
    log.error(e);
    packageJson = {};
  }

  return packageJson;
};