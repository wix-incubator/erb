'use strict';
const cluster = require('cluster'),
  bootstrapBi = require('../..');

if (cluster.isMaster) {
  cluster.fork();
  cluster.fork();
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