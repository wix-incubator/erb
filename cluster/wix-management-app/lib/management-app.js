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
    const healthUrl = `http://127.0.0.1:${appPort}${path}`;
    fetch(healthUrl, {
      headers: { Accept: 'application/json' }
    }).then(resp =>
      resp.ok ? success(healthUrl, res) : fail(healthUrl, res, resp)
    ).catch(next);
  });

  this.start = done => {
    const completed = done || _.noop;
    const container = express();
    container.use(mountPoint, app);
    return container.listen(managementPort, err => {
      log.debug('Management app listening on path: %s port: %s', mountPoint, managementPort);
      completed(err);
    });
  };
}

function success(url, res){
  log.debug('success /health/deployment/test %s', url);
  return res.send('Test passed');
}

function fail(url, res, resp){
  log.debug('fail /health/deployment/test url %s, headers %s', url, resp.headers);
  return resp.text().then(text => res.status(500).send(text));
}

function normalizePath(basePath) {
  return _.endsWith(basePath, '/') ? basePath : basePath + '/';
}

function noopAppInfoApp() {
  return (req, res) => res.end();
}