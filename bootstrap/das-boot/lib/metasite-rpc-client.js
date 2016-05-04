'use strict';
const wixBootstrap = require('wix-bootstrap'),
  config = require('./app-config');

module.exports.getMetasite = (ctx, id) => wixBootstrap
  .rpcClient(config.services.metasite, 'ReadOnlyMetaSiteManager')
  .invoke(ctx, 'getMetaSite', id);

