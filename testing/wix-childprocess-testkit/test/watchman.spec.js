const utils = require('./utils'),
  runner = require('../lib/watchman-runner');

describe('watchman', function() {
  let registry = {};

  beforeEach(() => {
    return utils.killProcesses(registry.watcherPid, registry.childPid)
      .then(() => registry = {parentPid: process.pid});
  });

  it('should exit when watched process exits', () => {
    return launchChild(registry)
      .then(() => launchWatcher(registry))
      .then(() => utils.expectProcessesToBeAlive(registry.childPid, registry.watcherPid))
    .then(() => utils.killProcess(registry.childPid))
    .then(() => utils.expectProcessesToNotBeAlive(registry.childPid, registry.watcherPid));
  });

  it('should exit if watched process is not available', () => {
    registry.childPid = -2;
    return launchWatcher(registry)
      .then(() => utils.expectProcessesToNotBeAlive(registry.watcherPid));
  });

  it('should kill watched process and suicide if parent process exits', () => {
    return launchChild(registry)
      .then(() => launchParent(registry))
      .then(() => launchWatcher(registry))
      .then(() => utils.expectProcessesToBeAlive(registry.childPid, registry.watcherPid, registry.parentPid))
      .then(() => utils.killProcess(registry.parentPid))
      .then(() => utils.expectProcessesToNotBeAlive(registry.childPid, registry.watcherPid, registry.parentPid))
  });

  it('should suicide if parent process pid does not exist', () => {
    registry.parentPid = -2;
    return launchWatcher(registry)
      .then(() => utils.expectProcessesToNotBeAlive(registry.watcherPid));
  });

  function launchWatcher(pidRegistry) {
    return runner({parentPid: registry.parentPid, watchedPid: registry.childPid})
      .then(pid => pidRegistry.watcherPid = pid)
      .catch(pid => pidRegistry.watcherPid = pid);
  }

  function launchChild(pidRegistry) {
    return utils.launchProcess().then(pid => pidRegistry.childPid = pid);
  }

  function launchParent(pidRegistry) {
    return utils.launchProcess().then(pid => pidRegistry.parentPid = pid);
  }
});
