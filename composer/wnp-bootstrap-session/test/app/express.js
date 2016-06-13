'use strict';
const express = require('express');

module.exports = config => {
  return express()
    .get('/v1', (req, res) => res.json(config.session.v1.decrypt(req.query.token)))
    .get('/v2', (req, res) => res.json(config.session.v2.decrypt(req.query.token)));
};