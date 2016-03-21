'use strict';
const http = require('http'),
  log = require('wix-logger').get('wix-bootstrap');

module.exports.run = (apps, cb) => {
  const server = http.createServer(() => {});
  const listeners = apps.map(app => app.attach(server));

  Promise.all(listeners)
    .then(() => {
      server.listen(process.env.PORT, err => {
        if (err) {
          log.error('server failed to start', err);
          Promise.reject(err);
        } else {
          log.debug('App listening on path: %s port: %s', process.env.MOUNT_POINT, process.env.PORT);
          Promise.resolve();
        }
      });
    }).then(cb).catch(cb);
};