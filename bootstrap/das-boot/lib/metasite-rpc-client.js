'use strict';
const wixBootstrap = require('wix-bootstrap'),
  config = require('./app-config');

module.exports.getMetasite = id => wixBootstrap
  .rpcClient(config.services.metasite, 'ReadOnlyMetaSiteManager')
  .invoke('getMetasite', id);

