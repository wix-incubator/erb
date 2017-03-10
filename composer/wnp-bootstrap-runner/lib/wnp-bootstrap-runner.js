const wixCluster = require('wix-cluster');

module.exports = opts => {
  return runnable => wixCluster.run(() => Promise.resolve().then(runnable), opts);
};
