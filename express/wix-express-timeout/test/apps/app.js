'use strict';
const express = require('express'),
  wixExpressTimeout = require('../..');

module.exports = () => {
  const app = express();

  app.use(wixExpressTimeout.get(10));

  app.use((req, res, next) => {
    res.on('x-timeout', message => res.status(504).send('timeout: ' + message));
    next();
  });

  app.get('/ok', (req, res) => res.send('hi'));
  app.get('/slow', (req, res) => setTimeout(() => res.send('slow'), 10000));

  app.use('/slower/*', wixExpressTimeout.get(100));

  app.get('/slower/but-fine', (req, res) => setTimeout(() => res.send('slower/but-fine'), 20));
  app.get('/slower/not-fine', (req, res) => setTimeout(() => res.send('slower/not-fine'), 2000));

  express()
    .use(process.env.MOUNT_POINT, app)
    .get(process.env.MOUNT_POINT + '/', (req, res) => res.end())
    .listen(process.env.PORT, () => console.log('App listening on port: %s', process.env.PORT));
};