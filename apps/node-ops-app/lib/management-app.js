'use strict';
const express = require('express'),
  cluster = require('cluster'),
  domain = require('domain');

module.exports = () => {
  const app = new express.Router();

  app.get('/health/deployment/test', (req, res) => {
    res.send('ok');
  });

  return new Promise(resolve => {
    const main = express().use(process.env.MOUNT_POINT, app);
    const server = main.listen(process.env.MANAGEMENT_PORT, () => {
      resolve(() => Promise.resolve().then(() => server.close()));
    });
  });
};