const cluster = require('cluster');
const timeout = parseInt(process.env['APP_TIMEOUT'] || 0);

module.exports = (app, context) => {
  app.get('/info', (req, res) => res.json({isWorker: cluster.isWorker, pid: process.pid}))
    .get('/', (req, res) => res.end())
    .get('/env-context', (req, res) => res.json(context.env))
    .get('/env', (req, res) => res.json(process.env))
    .get('/outerr', (req, res) => {
      console.log('an out');
      console.error('an err');
      res.end();
    })
    .get('/pid', (req, res) => res.send(`${process.pid}`))
    .get('/out', (req, res) => {
      console.log('an out');
      res.end();
    })
    .get('/err', (req, res) => {
      console.error('an err');
      res.end();
    });

  return new Promise(resolve => setTimeout(resolve, timeout))
    .then(() => app);
};

