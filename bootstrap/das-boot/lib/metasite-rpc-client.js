'use strict';
const wixBootstrap = require('wix-bootstrap'),
  config = require('./app-config');

module.exports.getMetasite = id => {
  wixBootstrap.rpcClient(config.metasiteId + '_rpc/ReadOnlyMetaSiteManager').invoke('getMetasite', id);
};