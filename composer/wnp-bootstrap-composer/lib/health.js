const fetch = require('node-fetch'),
  express = require('express'),
  log = require('wnp-debug')('wnp-bootstrap-composer');

module.exports.isAlive = isAlive;
module.exports.deploymentTest = deploymentTest;
module.exports.stop = stop;

function deploymentTest(context, getHealthStatus) {
  return () => {
    const app = new express.Router();

    app.get('/health/deployment/test', (req, res, next) => {
      const mountPoint = context.env.MOUNT_POINT === '/' ? '' : context.env.MOUNT_POINT;

      fetch(`http://localhost:${context.env.PORT}${mountPoint}/health/is_alive`, {
        timeout: 1000,
        headers: {Accept: 'application/json'}
      })
        .then(resp => resp.ok ? res.send('Test passed') : resp.text().then(text => Promise.reject(Error(text))))
        .catch(e => {
          log.error(e);
          next(e);
        });
    });

    app.get('/health/is_alive_detailed', (req, res) => {
      getHealthStatus()
        .then(tests => res.json(tests))
        .catch(err => {
          log.error(err.outcomes);
          log.error(JSON.stringify(err.outcomes));
          res.status(503).json(err.outcomes)
        });
    });

    return app;
  }
}

function isAlive(getHealthStatus) {
  return () => new express.Router().get('/health/is_alive', (req, res) => {
    getHealthStatus()
      .then(() => res.send('Alive'))
      .catch(() => res.status(503).end());
  });
}

//TODO: remove this altogether - there should be no capability to stop app
function stop(context, shutdownFn) {
  return () => new express.Router().post('/stop', (req, res) => {
    if (context.env.NODE_ENV === 'production') {
      res.status(403).end();
    } else {
      res.send('ok');
      shutdownFn();
    }
  });
}
