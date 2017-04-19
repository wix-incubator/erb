const loadConfiguration = require('./lib/load-configuration'),
  bootstrapExpress = require('./lib/wnp-bootstrap-express');

module.exports = ({env, config, timeout, newrelic, session, log, wixMeasuredFactory}) => {
  const configKeys = loadConfiguration({env, config, log});
  
  return bootstrapExpress({
    config: configKeys,
    timeout,
    newrelic,
    session,
    log,
    wixMeasuredFactory
  }, env.ENABLE_EXPRESS_METRICS);
};
