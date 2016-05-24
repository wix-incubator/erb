'use strict';
module.exports = (runMode, env, log) => {
  require('./new-relic')(runMode, env, log);
};
