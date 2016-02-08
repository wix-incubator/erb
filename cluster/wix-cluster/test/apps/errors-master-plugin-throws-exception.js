'use strict';
const cluster = require('cluster'),
  wixCluster = require('../..'),
  testNotifier = require('./parent-notifier-plugin'),
  express = require('express');

wixCluster({
  app: done => done(),
  workerCount: process.env.workerCount,
  plugins: [testNotifier(), new ErroingPlugin()],
  managementApp: new ManagementApp()
}).start(err => {
  if (err) {
    process.send({event: 'start-completed', err: { name: err.name, message: err.message}});
  }
});

function ErroingPlugin() {
  this.onMaster = (cluster, next) => {
    throw new Error('master plugin throws');
  };
}

function ManagementApp() {
  this.start = done => {
    const app = express();
    app.get('/', (req, res) => res.end());
    app.listen(3004, err => done(err));
  };
}
