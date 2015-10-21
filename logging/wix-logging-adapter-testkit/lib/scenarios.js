'use strict';
const cluster = require('cluster'),
  Plugin = require('wix-logging-cluster-plugin'),
  express = require('express');

exports.worker = ctx => {
  let plugin = new Plugin();

  if (cluster.isMaster) {
    cluster.on('online', () => {
      process.send('cluster-online');
    });

    plugin.onMaster(cluster, () => {
      cluster.fork();
    });
  } else {
    ctx.setup();
    ctx.action();
  }
};

exports.master = ctx => {
  let plugin = new Plugin();

  if (cluster.isMaster) {
    cluster.on('online', () => {
      process.send('cluster-online');
    });

    plugin.onMaster(cluster, () => {
      ctx.setup();
      ctx.action();
      cluster.fork();
    });
  }
};

exports.express = ctx => {
  let plugin = new Plugin();

  if (cluster.isMaster) {
    cluster.on('listening', () => {
      process.send('cluster-listening');
    });

    plugin.onMaster(cluster, () => {
      cluster.fork();
    });
  } else {
    ctx.setup();
    let app = express();

    app.get('/', (req, res) => {
      ctx.action();
      res.end();
    });

    app.listen(3000);
  }
};