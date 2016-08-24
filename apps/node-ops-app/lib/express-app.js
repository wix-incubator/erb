'use strict';
const express = require('express'),
  cluster = require('cluster'),
  domain = require('domain');

module.exports = context => {
  const config = context.config.json('app');
  const app = new express.Router();

  let counter = 0;
  let dieEvery = 100;

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
      res.status(500).end();
      throw new Error('die my darling');
    });
  });

  app.get('/maybe', (req, res) => {
    counter++;
    let die = req.query.every || dieEvery;

    if (counter >= die) {
      setTimeout(() => {
        // res.status(req.query.status || 500).send(`worker: ${cluster.worker.id}, dieEvery: ${die}, deathCount: ${counter}`);
        res.status(req.query.status || 500).send(`ok`);
        counter = -1000000;
        throw new Error('die my darling');
      }, 10);
    } else {
      setTimeout(() => {
        // res.send(`worker: ${cluster.worker.id}, dieEvery: ${die}, deathCount: ${counter}`);
        res.send(`ok`);
      }, 10);
    }
  });

  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(new express.Router().use('/api', app)), 2000);
  });
};