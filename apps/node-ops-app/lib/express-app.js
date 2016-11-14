'use strict';
const express = require('express'),
  cluster = require('cluster');

module.exports = () => {
  const app = new express.Router();
  let counter = 0;

  app.get('/api/hello', (req, res) => {
    setTimeout(() => res.send('hi'), 50);
  });

  app.get('/api/exit', (req, res) => {
    res.end();
    process.nextTick(() => process.exit(0));
  });
  
  app.get('/api/info', (req, res) => {
    setTimeout(() => {
      res.json({
        workerId: cluster.worker.id
      });
    }, 10);
  });

  app.get('/api/die', (req, res) => {
    process.nextTick(() => {
      res.status(500).end();
      throw new Error('die my darling');
    });
  });

  app.get('/api/maybe', (req, res) => {
    counter++;
    let die = req.query.every || 100;
    let timeout = req.query.timeout || 10;

    if (counter !== undefined && counter >= die) {
      counter = undefined;
      setTimeout(() => {
        res.status(req.query.status || 500).send(`ok`);
        throw new Error('die my darling');
      }, timeout);
    } else {
      setTimeout(() => res.send(`ok`), timeout);
    }
  });

  return app;
};
