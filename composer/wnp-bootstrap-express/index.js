const loadConfiguration = require('./lib/load-configuration'),
  bootstrapExpress = require('./lib/wnp-bootstrap-express');

module.exports = ({env, config, timeout, newrelic, session, log, wixMeasuredFactory, artifactInfo}) => {
  const configKeys = loadConfiguration({env, config, artifactInfo, log});
  
  return bootstrapExpress({
    config: configKeys,
    timeout,
    newrelic,
    session,
    log,
    wixMeasuredFactory
  });
};
