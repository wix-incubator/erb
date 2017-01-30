'use strict';
const express = require('express');

module.exports = context => {
  return express()
    .get('/meter', (req, res) => {
      context.metrics.client.meter(req.query.key || 'aKey');
      res.end();
    })
    .get('/context-keys', (req, res) => res.json(Object.keys(context)));
};
