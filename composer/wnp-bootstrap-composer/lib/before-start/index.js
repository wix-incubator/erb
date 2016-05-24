'use strict';

module.exports = (runMode, env, log) => {
  const stoppables = [];
  require('./env-augmentor')(runMode, env, log);
  require('./env-validator')(env);

  stoppables.push(require('./patch-http')(require('wix-patch-server-response')));
  stoppables.push(require('./uncaught-exception')(process, log));
  stoppables.push(require('./unhandled-rejection')(process, log));

  return stoppables;
};