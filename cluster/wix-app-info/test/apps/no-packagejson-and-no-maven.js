'use strict';
const express = require('express'),
  app = require('../..');

express().use(process.env.MOUNT_POINT, app({appDir: './test/'})).listen(process.env.PORT, () => {
  console.log('app started on port: ' + process.env.PORT + ' mount: ' + process.env.MOUNT_POINT);
});