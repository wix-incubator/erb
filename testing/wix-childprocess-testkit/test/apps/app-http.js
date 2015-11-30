'use strict';
require('express')()
  .get(process.env.MOUNT_POINT, (req, res) => res.send('Hello'))
  .get(process.env.MOUNT_POINT + '/test', (req, res) => res.end())
  .listen(process.env.PORT);