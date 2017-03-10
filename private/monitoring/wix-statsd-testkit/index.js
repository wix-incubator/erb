const WixStatsdTestkit = require('./lib/wix-statsd-testkit');

module.exports.server = opts => new WixStatsdTestkit(opts);
