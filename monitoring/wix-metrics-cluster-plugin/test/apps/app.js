'use strict';
var express = require('express'),
  wixCluster = require('wix-cluster'),
  wixMetricsPlugin = require('../..').clusterPlugin(),
  serverResponsePatch = require('wix-patch-server-response'),
  wixExpressDomain = require('wix-express-domain'),
  wixExpressErrorCapture = require('wix-express-error-capture'),
  wixExpressErrorHandler = require('wix-express-error-handler').handler,
  wixExpressTimeout = require('wix-express-timeout'),
  wixExpressMonitor = require('wix-express-monitor'),
  wixExpressMonitorCallback = require('../../').wixExpressMonitorCallback;

wixCluster({
  app: () => new App(),
  managementApp: new ManagementApp(),
  workerCount: 1,
  plugins: [wixMetricsPlugin]
}).start();

function ManagementApp() {
  const app = express();
  const metrics = require('wix-measured').default;

  app.get(`${process.env.MOUNT_POINT}/stats`, (req, res) => res.send(metrics.toJSON()));

  this.start = () => app.listen(process.env.MANAGEMENT_PORT);
}

function App() {
  serverResponsePatch.patch();
  const app = express()
    .use(wixExpressDomain)
    .use(wixExpressErrorCapture.async)
    .use(wixExpressErrorHandler(wixCluster.workerShutdown.shutdown))
    .use(wixExpressTimeout.get(100))
    .use(wixExpressMonitor.get(wixExpressMonitorCallback));

  let x = 0;

  app.get('/', (req, res) => {
    x++;
    res.send('Hello');
  });

  app.get('/operation', (req, res) =>
    res.send('result'));

  app.get('/timeout', (req, res) =>
    res.write('this is gonna take time'));

  app.get('/error', (req, res) => {
    process.nextTick(() => {
      throw new Error('die');
    });
    res.end();
  });

  app.get('/custom-error', function (req, res) {
    process.nextTick(function () {
      throw new MountainError('some message');
    });
    res.end();
  });

  app.use(wixExpressErrorCapture.sync);

  express()
    .get(process.env.MOUNT_POINT + '/health/is_alive', (req, res) => res.end())
    .use(process.env.MOUNT_POINT, app)
    .listen(process.env.PORT, () => console.log('App listening on port: %s', process.env.PORT));
}

function MountainError(message) {
  Error.captureStackTrace(this);
  this.message = message;
  this.name = 'MountainError';
}
MountainError.prototype = Object.create(Error.prototype);