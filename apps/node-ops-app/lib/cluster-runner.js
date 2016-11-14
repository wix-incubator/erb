'use strict';
const wixCluster = require('wix-new-cluster');

module.exports = (ctx, opts) => {
  const clusterOpts = Object.assign({}, {metrics: {
    app_name: ctx.app.name,
    app_host: ctx.env.HOSTNAME
  }}, opts);

  return runnable => wixCluster.run(() => Promise.resolve().then(runnable), clusterOpts);
};
