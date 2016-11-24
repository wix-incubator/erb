'use strict';
const wixCluster = require('wix-new-cluster');

module.exports = opts => {
  return runnable => wixCluster.run(() => Promise.resolve().then(runnable), opts);
};
