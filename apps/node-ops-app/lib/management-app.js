'use strict';
const express = require('express'),
  cluster = require('cluster'),
  domain = require('domain'),
  http = require('http');

module.exports = () => {
  const app = new express.Router();

  app.get('/health/deployment/test', (req, res) => {
    res.send('ok');
  });

  return new Promise(resolve => {
    const main = express().use(process.env.MOUNT_POINT, app);
      const server = require('http-shutdown')(http.createServer(main)).listen(process.env.MANAGEMENT_PORT, () => {
      resolve(() => Promise.resolve()
        .then(() => server.shutdown())
        .then(() => console.log('management app closed')));
    });
  });
};