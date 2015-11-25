'use strict';
require('express')()
  .get(process.env.MOUNT_POINT, (req, res) => res.end())
  .get(process.env.MOUNT_POINT + '/test', (req, res) => res.end())
  .listen(process.env.PORT);