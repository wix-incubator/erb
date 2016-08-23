'use strict';
const express = require('express'),
  cluster = require('cluster'),
  domain = require('domain');

module.exports = context => {
  const app = new express.Router();
  
  app.get('/hello', (req, res) => {
    setTimeout(() => res.send('hi'), 50);
  });

  app.get('/info', (req, res) => {
    setTimeout(() => {
      res.json({
        workerId: cluster.worker.id
      });
    }, 10);
  });

  app.get('/die', (req, res) => {
    process.nextTick(() => {
      res.end();
      throw new Error('die my darling');
    });
  });

  return new express.Router().use('/api', app);
};