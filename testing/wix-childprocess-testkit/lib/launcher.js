'use strict';
const path = require('path'),
  cluster = require('cluster');

if (cluster.isWorker === false) {
  require('./watcher').installOnClient(process.env.APP_TO_LAUNCH, process.env.APP_TO_LAUNCH_TIMEOUT);
}

if (path.isAbsolute(process.env.APP_TO_LAUNCH)) {
  require(process.env.APP_TO_LAUNCH);
} else {
  require(path.join(process.cwd(), process.env.APP_TO_LAUNCH));
}

