'use strict';
const express = require('express');

module.exports = () => {
  const app = new express.Router();

  app.use((req, res, next) => {
    res.on('x-before-flushing-headers', () => res.append('x-before-flushing-headers', 'triggered'));
    next();
  });

  app.get('/custom', (req, res) => res.send('custom'));
  app.get('/patch', (req, res) => res.end());

  return app;
};