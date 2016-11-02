'use strict';
const Composer = require('wnp-bootstrap-composer').Composer,
  cluster = require('cluster');

new Composer({runner: () => clusterRunner()})
  .use(require('wnp-bootstrap-config'))
  .use(require('../..'))
  .express('./test/app/express')
  .start();

function clusterRunner() {
  return runnable => {
    if (cluster.isMaster) {
      cluster.on('message', (worker, msg) => console.log('received message: ', JSON.stringify(msg)));
      cluster.fork();
    } else {
      runnable();
    }
  }
}

