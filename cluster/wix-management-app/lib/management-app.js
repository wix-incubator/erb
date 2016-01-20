'use strict';
const express = require('express'),
  request = require('request'),
  log = require('wix-logger').get('management-app'),
  _ = require('lodash');

module.exports = opts => new ManagementApp(opts);

function ManagementApp(opts) {
  const appPort = opts.appPort || 8080;
  const managementPort = opts.managementPort || 8084;
  const mountPoint = opts.mountPoint || '';
  const appInfoApp = opts.appInfo || noopAppInfoApp();

  const app = express();

  app.use(`${mountPoint}/app-info`, appInfoApp);

  app.get(`${mountPoint}/health/deployment/test`, (req, res) => {
    request(`http://localhost:${appPort}${mountPoint}/health/is_alive`, error => {
      error ? res.status(500).send(error) : res.send('Test passed');
    });
  });

  this.start = done => {
    const completed = done || _.noop;
    return app.listen(managementPort, () => {
      log.debug('Management app listening on path: %s port: %s', mountPoint, managementPort);
      completed();
    });
  };
}

function noopAppInfoApp() {
  return (req, res) => res.end();
}