'use strict';
var app = require('./app'),
  wixClusterBuilder = require('wix-cluster').builder;

if (true) {
  throw new Error('I\'m not working');
}
wixClusterBuilder(app)
  .withWorkerCount(1)
  .start();

