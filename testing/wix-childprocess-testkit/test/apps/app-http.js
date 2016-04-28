'use strict';
require('express')()
  .get(process.env.MOUNT_POINT, (req, res) => res.send('Hello'))
  .get(process.env.MOUNT_POINT + '/test', (req, res) => res.end())
  .get(process.env.MOUNT_POINT + '/env', (req, res) => res.json(process.env))
  .get(process.env.MOUNT_POINT + '/args', (req, res) => res.json(process.args))
  .get(process.env.MOUNT_POINT + '/execArgv', (req, res) => res.json(process.execArgv))
  .listen(process.env.PORT);