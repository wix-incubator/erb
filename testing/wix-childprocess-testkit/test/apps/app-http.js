'use strict';
const express = require('express');

process.on('SIGTERM', () => console.log('SIGTERM received by child process'));

const app = express()
  .get('/', (req, res) => res.send('Hello'))
  .get('/test', (req, res) => res.end())
  .get('/pid', (req, res) => res.text(process.pid))
  .get('/env', (req, res) => res.json(process.env))
  .get('/args', (req, res) => res.json(process.args))
  .get('/execArgv', (req, res) => res.json(process.execArgv));

express()
  .use(process.env.MOUNT_POINT, app)
  .listen(process.env.PORT, () => console.log('started'));
