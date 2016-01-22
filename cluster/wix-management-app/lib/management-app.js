'use strict';
const express = require('express'),
  log = require('wix-logger').get('management-app'),
  _ = require('lodash'),
  fetch = require('node-fetch');

module.exports = opts => new ManagementApp(opts);

function ManagementApp(opts) {
  const appPort = opts.appPort || 8080;
  const managementPort = opts.managementPort || 8084;
  const mountPoint = opts.mountPoint || '';
  const appInfoApp = opts.appInfo || noopAppInfoApp();

  const app = express();

  app.use(`${mountPoint}/app-info`, appInfoApp);

  app.get(`${mountPoint}/health/deployment/test`, (req, res, next) => {
    fetch(`http://localhost:${appPort}${mountPoint}/health/is_alive`).then(resp =>
      resp.ok ? res.send('Test passed') : resp.text().then(text => res.status(500).send(text))
    ).catch(next);
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