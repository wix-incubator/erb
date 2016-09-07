'use strict';
const fetch = require('node-fetch'),
  express = require('express'),
  log = require('wnp-debug')('wnp-bootstrap-composer');

module.exports.isAlive = isAlive;
module.exports.deploymentTest = deploymentTest;
module.exports.stop = stop;

function deploymentTest(context) {
  return () => new express.Router().get('/health/deployment/test', (req, res, next) => {
    const mountPoint = context.env.MOUNT_POINT === '/' ? '' : context.env.MOUNT_POINT;

    fetch(`http://localhost:${context.env.PORT}${mountPoint}/health/is_alive`, {timeout: 1000, headers: {Accept: 'application/json'}})
      .then(resp => resp.ok ? res.send('Test passed') : resp.text().then(text => Promise.reject(Error(text))))
      .catch(e => {
        log.error(e);
        next(e);
      });
  });
}

function isAlive() {
  return () => new express.Router().get('/health/is_alive', (req, res) => res.send('Alive'));
}

//TODO: remove this altogether - there should be no capability to stop app
function stop(context, shutdownFn) {
  return () => new express.Router().post('/stop', (req, res) => {
    if (context.env.NODE_ENV === 'production') {
      res.status(403).end();
    } else {
      res.send('ok');
      shutdownFn();
    }
  });
}