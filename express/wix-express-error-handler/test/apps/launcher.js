'use strict';
var app = require('./app'),
  wixClusterBuilder = require('wix-cluster').builder;

wixClusterBuilder(app)
  .withWorkerCount(1)
  .start();
