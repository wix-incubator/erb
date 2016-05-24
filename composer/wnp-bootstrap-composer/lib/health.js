'use strict';
const fetch = require('node-fetch'),
  express = require('express'),
  log = require('wnp-debug')('wnp-bootstrap-composer');

module.exports.isAlive = isAlive;
module.exports.deploymentTest = deploymentTest;

function deploymentTest(context) {
  return () => new express.Router().get('/health/deployment/test', (req, res, next) => {
    fetch(`http://localhost:${context.env.PORT}${context.env.MOUNT_POINT || ''}/health/is_alive`, {timeout: 1000, headers: {Accept: 'application/json'}})
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