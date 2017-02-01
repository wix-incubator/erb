const express = require('express'),
  fetch = require('node-fetch');

module.exports = context => {
  context.management.addHealthTest('service-specific', () => healthCheck());

  return new express.Router()
    .get('/', (req, res) => res.end())
};

function healthCheck() {
  return fetch(process.env.HEALTH_TEST_URL).then(res => {
    if (res.ok) {
      return Promise.resolve();
    } else {
      return Promise.reject(new Error(`expected 200, but instead got ${res.status}`))
    }
  })
}
