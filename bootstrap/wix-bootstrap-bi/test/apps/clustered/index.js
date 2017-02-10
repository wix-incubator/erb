const cluster = require('cluster'),
  bootstrapBi = require('../../..');

if (cluster.isMaster) {
  cluster.fork();
  cluster.fork();
} else {
  bootstrapBi.di.value({
    env: {
      APP_LOG_DIR: process.env.APP_LOG_DIR
    },
    app: {
      name: 'test-app-name'
    }
  }).logger({})
    .log({evtId: cluster.worker.id})
    .then(() => process.exit());
}
