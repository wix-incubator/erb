'use strict';
const http = require('http'),
  log = require('wix-logger').get('bootstrap');

module.exports.run = (apps, cb) => {
  const server = http.createServer((req, res) => {});
  apps.forEach(app => app().attach(server));

  server.listen(process.env.PORT, () => {
    log.debug('App listening on path: %s port: %s', process.env.MOUNT_POINT, process.env.PORT);
    cb();
  });
};