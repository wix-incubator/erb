'use strict';
const fetch = require('node-fetch'),
  express = require('express');

module.exports.isAlive = isAlive;
module.exports.deploymentTest = deploymentTest;

function deploymentTest(context) {
  return () => new express.Router().get('/health/deployment/test', (req, res, next) => {
    fetch(`http://127.0.0.1:${context.env.port}${context.env.mountPoint}/health/is_alive`, {headers: {Accept: 'application/json'}})
      .then(resp => resp.ok ? res.send('Test passed') : resp.text().then(text => Promise.reject(Error(text))))
      .catch(e => {
        console.log(e);
        next(e);
      });
  });
}

function isAlive() {
  return () => new express.Router().get('/health/is_alive', (req, res) => res.send('Alive'));
}