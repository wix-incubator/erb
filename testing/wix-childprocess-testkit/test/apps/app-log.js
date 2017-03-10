
console.info('info log');
console.error('error log');

require('express')()
  .get(process.env.MOUNT_POINT, (req, res) => res.end())
  .get(process.env.MOUNT_POINT + '/test', (req, res) => res.end())
  .listen(process.env.PORT);

