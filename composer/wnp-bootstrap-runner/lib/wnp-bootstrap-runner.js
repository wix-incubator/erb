'use strict';
const runMode = require('wix-run-mode'),
  wixCluster = require('wix-cluster');

module.exports = opts => {
  if (runMode.isDebug()) {
    return runnable => promisify(runnable)();
  } else {
    return runnable => wixCluster.run(promisify(runnable), opts);
  }
};

function promisify(fn) {
  return () => Promise.resolve().then(fn);
}