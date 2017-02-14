const Composer = require('wnp-bootstrap-composer').Composer;

module.exports = opts => new BootstrapNg(opts);

class BootstrapNg extends Composer {
  constructor(opts) {
    super(composerOptions(opts));
  }

  start(opts) {
    const options = {};

    if (opts) {
      options.env = opts.env;

      if (opts.disableCluster && opts.disableCluster === true) {
        options.disable = ['runner'];
      }
    }

    return super.start(options);
  }
}

function composerOptions(opts = {}) {
  return {
    runner: ctx => runner(ctx, opts.cluster),
    health: opts.health,
    express: opts.express,
    rpc: opts.rpc
  }
}

function runner(initialContext, opts) {
  const clusterOpts = Object.assign({}, {
    metrics: {
      app_name: initialContext.app.name,
      app_host: initialContext.env.HOSTNAME
    },
    statsd: initialContext.statsd
  }, opts);

  return require('wnp-bootstrap-runner')(clusterOpts)
}
