'use strict';
const bootstrap = require('../../..');

module.exports = app => {
  bootstrap.addShutdownHook(() => console.log('shutdown hook was called'));

  app.get('/die', () => {
    process.nextTick(() => {
      throw new Error('die die my darling');
    });
  });
};