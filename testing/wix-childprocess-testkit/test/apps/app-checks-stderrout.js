'use strict';
console.info('logged stdout check');
console.error('logged stderr check');

require('express')()
  .get(process.env.MOUNT_POINT, (req, res) => res.end())
  .listen(process.env.PORT);