const wixCluster = require('../..'),
  express = require('express');

require('../support/test-stats-app')();
wixCluster.run(worker, {metrics: {app_host: 'local', app_name: 'my-app'}});

function worker() {
  process.send({
    origin: 'wix-cluster',
    key: 'statsd',
    value: {
      host: 'localhost',
      interval: 1000
    }
  });

  const app = express()
    .get('/', (req, res) => res.end())
    .post('/die', (req, res) => {
      process.nextTick(() => {
        res.end();
        throw new Error('die');
      });
    });

  return new Promise(resolve => {
    const server = require('http').createServer(app);
    server.listen(3000, () => resolve(() => server.close()));
  });
}
