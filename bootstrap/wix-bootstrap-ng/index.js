const Composer = require('wnp-bootstrap-composer').Composer;

module.exports = opts => new BootstrapNg(opts);

class BootstrapNg extends Composer {
  constructor(opts) {
    super(composerOptions(opts));
    super.use(require('wnp-bootstrap-config'));
    super.use(require('wnp-bootstrap-session'));
    super.use(require('wnp-bootstrap-statsd'));
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
    composers: {
      mainExpress: () => require('wnp-bootstrap-express')(opts.express),
      managementExpress: () => require('wnp-bootstrap-management')
    },
    health: opts.health
  }
}

function runner(initialContext, opts) {
  const clusterOpts = Object.assign({}, {metrics: {
    app_name: initialContext.app.name,
    app_host: initialContext.env.HOSTNAME
  }}, opts);

  return require('wnp-bootstrap-runner')(clusterOpts)
}
