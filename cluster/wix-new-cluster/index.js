'use strict';
const cluster = require('cluster');

module.exports.run = (appFunction, opts) => {
  if (cluster.isMaster) {
    return require('./lib/wix-cluster-master')(opts);
  } else {
    return require('./lib/wix-cluster-worker')(appFunction);
  }
};