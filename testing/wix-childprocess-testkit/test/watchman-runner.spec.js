const utils = require('./utils'),
  runner = require('../lib/watchman-runner'),
  fork = require('child_process').fork;

describe('watchman-runner', function () {
  this.timeout(10000);
  let registry = {};

  beforeEach(() => {
    return utils.killProcesses(registry.watcherPid, registry.childPid)
      .then(() => registry = {parentPid: process.pid});
  });

  it('should launch a watcher process and return watcher process pid', () => {
    return launchChild(registry)
      .then(() => runner({parentPid: registry.parentPid, watchedPid: registry.childPid}))
      .then(watcherPid => utils.expectProcessesToBeAlive(registry.childPid, watcherPid))
  });

  it('should launch watcher in detached mode', () => {
    return launchChild(registry)
      .then(() => launchParentWithWatcher(registry))
      .then(() => utils.expectProcessesToBeAlive(registry.childPid, registry.parentPid, registry.watcherPid))
      .then(() => utils.killProcess(registry.parentPid))
      .then(() => utils.expectProcessesToNotBeAlive(registry.childPid, registry.parentPid, registry.watcherPid));
  });

  function launchChild(pidRegistry) {
    return utils.launchProcess().then(pid => pidRegistry.childPid = pid);
  }

  function launchParentWithWatcher(pidRegistry) {
    return new Promise((resolve, reject) => {
      let output = '';
      const logAndReject = (err) => {console.log(output); reject({pid: child.pid, error: err})};

      const child = fork('./test/apps/fork-watchman.js', {
        env: Object.assign({}, process.env, {WATCHED_PID: pidRegistry.childPid}),
        stdio: 'inherit'
      });

      child.on('message', msg => {
        if (msg.indexOf('pid') > -1) {
          pidRegistry.parentPid = child.pid;
          pidRegistry.watcherPid = msg.split('=')[1];
          resolve(child.pid);
        } else {
          logAndReject(Error(msg));
        }
      });

      child.on('exit', code => logAndReject(Error('child exited with code ' + code)));
      child.on('error', err => logAndReject(err));
    });
  }
});
