'use strict';
const wixConfig = require('wix-config');

module.exports = confDir => {
  wixConfig.setup(confDir);
  return wixConfig;
};