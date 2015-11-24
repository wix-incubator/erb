'use strict';
var app = require('./app'),
  wixClusterBuilder = require('wix-cluster').builder,
  testNotifier = require('../../index').testNotifierPlugin;

let testNotificationCallback = (event, workerId) => {
  if (event === 'listening') {
    setTimeout(() => {
      throw new Error('Master is dying after cluster worker is listening');
    }, 100);
  }
};

wixClusterBuilder(app)
  .withWorkerCount(1)
  .addPlugin(testNotifier(testNotificationCallback))
  .start();


