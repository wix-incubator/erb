'use strict';
module.exports.setup = cluster => {
  if (cluster.isWorker) {
    require('wix-logging-client-support').addTo(require('wix-logging-client'));
  }
};