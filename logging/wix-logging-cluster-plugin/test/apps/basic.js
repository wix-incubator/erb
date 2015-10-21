'use strict';
const cluster = require('cluster'),
  write = require('wix-logging-client').write,
  plugin = require('../../')();

if (cluster.isMaster) {
  cluster.on('disconnect', () => {
    process.send('cluster-online');
  });

  plugin.onMaster(cluster, () => {
    cluster.fork();
  });

} else {
  write({
    timestamp: parseInt(process.env.timestamp),
    level: process.env.level,
    category: 'cat',
    msg: 'log message'
  });
  cluster.worker.disconnect();
}



