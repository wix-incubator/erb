'use strict';
const cluster = require('cluster'),
  bootstrapBi = require('../..');

// const workerIds = [];
if (cluster.isMaster) {
  cluster.fork();
  cluster.fork();
  // cluster.on('exit', worker => {
  //   workerIds.push(worker.id);
  //   if (workerIds.length === 2) {
  //     process.exit();
  //   }
  // });
} else {
  bootstrapBi({
    env: {
      logDir: process.env.LOG_DIR
    },
    app: {
      artifactName: 'test-app-name'
    }
  }).logger({})
    .log({evtId: cluster.worker.id})
    .then(() => process.exit());
}