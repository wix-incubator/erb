'use strict';
var app = require('./dirty-app'),
    wixClusterBuilder = require('../../lib/wix-cluster').builder;

wixClusterBuilder(app)
  .withWorkerCount(1)
  .start();