'use strict';
const wixConfig = require('wix-config');

module.exports.di = {
  key: 'config',
  value: context => load(context.env.confDir)
};

function load(confDir) {
  wixConfig.setup(confDir);
  return wixConfig;
}