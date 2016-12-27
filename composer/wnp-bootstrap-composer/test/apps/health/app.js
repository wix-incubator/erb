const express = require('express');

module.exports = context => {
  let healthCheck = () => Promise.resolve();
  context.management.addHealthTest('service-specific', () => healthCheck());

  return new express.Router()
    .get('/', (req, res) => res.end())
    .post('/health-check-fail', (req, res) => {
      healthCheck = () => Promise.reject(new Error('woop'));
      res.end();
    })
    .post('/health-check-pass', (req, res) => {
      healthCheck = () => Promise.resolve();
      res.end();
    });
};
