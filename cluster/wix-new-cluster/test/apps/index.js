const express = require('express'),
  cluster = require('cluster');

module.exports = () => {

  const app = express();
  const stats = {};
  const broadcasted = [];

  process.on('message', msg => {
    if (msg.origin && msg.origin === 'wix-cluster' && msg.key) {
      if (msg.key === 'worker-count') {
        stats.workerCount = msg.value;
      } else if (msg.key === 'death-count') {
        stats.deathCount = msg.value;
      } else if (msg.key === 'stats') {
        stats.stats = msg.value;
      } else if (msg.key === 'broadcast') {
        broadcasted.push(msg.value);
      }
    }
  });

  app.get('/stats', (req, res) => res.json(stats));
  app.get('/broadcasts', (req, res) => res.json(broadcasted));
  app.get('/id', (req, res) => res.send(cluster.worker.id.toString()));

  app.post('/broadcast/:key/:value', (req, res) => {
    process.send({
      origin: 'wix-cluster',
      key: 'broadcast',
      value: { key: req.params.key, value: req.params.value}
    });
    res.end();
  });

  app.get('/', (req, res) => res.send('ok'));

  app.get('/random-delay', (req, res) => {
    setTimeout(() => res.send('ok'), Math.floor((Math.random() * 1000) + 1));
  });

  app.post('/die', (req, res) => {
    process.nextTick(() => {
      res.end();
      throw new Error('die');
    });
  });

  const server = require('http').createServer(app);
  const closeFn = () => new Promise((resolve, reject) => {
    console.log('app closed function called');
    server.close(err => err ? reject(err): resolve());
  });
  return new Promise(resolve => server.listen(process.env.PORT, () => {
    console.log('server listening on', process.env.PORT);
    resolve(closeFn);
  }));
};