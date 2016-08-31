'use strict';
const express = require('express'),
  cluster = require('cluster'),
  domain = require('domain'),
  http = require('http');

module.exports = () => {
  const newrelic = require('newrelic');
  const app = new express.Router();

  let counter = 0;
  let send500 = false;

  app.get('/health/is_alive', (req, res) => {
    res.send('Alive');
  });

  app.get('/api/hello', (req, res) => {
    setTimeout(() => res.send('hi'), 50);
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
        console.log('dying');
        throw new Error('die my darling');
      }, timeout);
    } else {
      setTimeout(() => {
        res.send(`ok`);
      }, timeout);
    }
  });

  return new Promise(resolve => {
    const main = express().use(process.env.MOUNT_POINT, app);
    const server = require('http-shutdown')(http.createServer(main)).listen(process.env.PORT, () => {
      resolve(() =>
        Promise.resolve()
          .then(() => newrelic.shutdown({collectPendingData: true}, () => server.shutdown()))
          .then(() => console.log('main app closed'))
      );
    });
  });
};