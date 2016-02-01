'use strict';
require('express')()
  .get(process.env.MOUNT_POINT, (req, res) => res.send('Hello'))
  .get(process.env.MOUNT_POINT + '/test', (req, res) => res.end())
  .get(process.env.MOUNT_POINT + '/env', (req, res) => res.json(process.env))
  .listen(process.env.PORT);