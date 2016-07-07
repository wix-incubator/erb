'use strict';
const Composer = require('wnp-bootstrap-composer').Composer;

module.exports = opts => {
  return new Composer(composerOptions(opts || {}))
    .use(require('wnp-bootstrap-config'))
    .use(require('wnp-bootstrap-session'))
};

function composerOptions(opts) {
  return {
    runner: () => require('wnp-bootstrap-runner')(opts.cluster),
      composers: {
    mainExpress: () => require('wnp-bootstrap-express')(opts.express),
      managementExpress: () => require('wnp-bootstrap-management')
  }
  }
}