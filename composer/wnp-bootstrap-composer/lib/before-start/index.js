module.exports = (runMode, env, log) => {
  const stoppables = [];
  require('./env-augmentor')(runMode, env, log);
  require('./env-validator')(env);

  //TODO: test those are closed
  stoppables.push({fn: require('./patch-http')(require('wix-patch-server-response')), name: 'patch http'});
  stoppables.push({fn: require('./unhandled-rejection')(process, log), name: 'unhandled rejection handler'});
  //TODO: figure out a proper place for this one
  stoppables.push({fn: closeNewRelic, name: 'new relic'});
  return stoppables;
};

//TODO: this should live somewhere with new relic logic - move to separate bootstrap module
function closeNewRelic() {
  return new Promise((resolve, reject) => {
    require('newrelic').shutdown({collectPendingData: false}, err => err ? reject(err) : resolve());
    setTimeout(() => reject(Error('timeout of 2000 hit')), 2000);
  });
}
