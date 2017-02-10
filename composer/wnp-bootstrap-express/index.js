const loadConfiguration = require('./lib/load-configuration'),
  bootstrapExpress = require('./lib/wnp-bootstrap-express');

module.exports = ({env, config, timeout, newrelic, session, log}) => {
  const seenBy = loadConfiguration({env, config, log});
  return bootstrapExpress({seenBy, timeout, newrelic, session, log});
};
