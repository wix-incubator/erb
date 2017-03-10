module.exports = (runMode, env, log, newRelicFn) => {
  require('./new-relic')(runMode, env, log, newRelicFn);
};
