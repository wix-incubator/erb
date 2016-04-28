'use strict';
const express = require('express');

module.exports = config => {
  return new express.Router()
  .get('/env', (req, res) => res.json(config.env))
  .get('/app', (req, res) => res.json(config.app))
  .get('/newrelic', (req, res) => res.send(config.newrelic !== undefined));
};