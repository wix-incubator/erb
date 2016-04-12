'use strict';
const express = require('express'),
  log = require('wix-logger').get('management-app'),
  _ = require('lodash'),
  fetch = require('node-fetch'),
  join = require('path').join;

module.exports = opts => new ManagementApp(opts);

function ManagementApp(opts) {
  const appPort = opts.appPort || 8080;
  const managementPort = opts.managementPort || 8084;
  const mountPoint = opts.mountPoint || '';
  const appInfoApp = opts.appInfo || noopAppInfoApp();

  const app = express();

  app.use('/app-info', appInfoApp);

  app.get('/health/deployment/test', (req, res, next) => {
    const path = join(normalizePath(mountPoint), '/health/is_alive');
    fetch(`http://127.0.0.1:${appPort}${path}`, {
      headers: {Accept: 'application/json'}
    }).then(resp =>
      resp.ok ? res.send('Test passed') : resp.text().then(text => Promise.reject(Error(text)))
    ).catch(next);
  });

  app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }

    log.error(err);
    res.status(500).send(err.message);
    next();
  });

  this.start = () => {
    return new Promise((resolve, reject) => {
      const container = express();
      container.use(mountPoint, app);
      return container.listen(managementPort, err => {
        if (err) {
          reject(err);
        } else {
          log.debug('Management app listening on path: %s port: %s', mountPoint, managementPort);
          resolve();
        }
      });
    });
  };
}

function normalizePath(basePath) {
  return _.endsWith(basePath, '/') ? basePath : basePath + '/';
}

function noopAppInfoApp() {
  return (req, res) => res.end();
}