'use strict';
const stdOutErr = require('wix-stdouterr-testkit'),
  spawn = require('child_process').spawn,
  expect = require('chai').use(require('chai-as-promised')).expect,
  utils = require('./utils');

describe.only('watchman', function () {
  this.timeout(10000);
  let registry = {};
  const interceptor = stdOutErr.interceptor().beforeAndAfterEach();

  beforeEach(() => {
    return Promise.all([registry.watcherPid, registry.childPid].map(pid => utils.killProcess(pid)))
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
      .then(() => utils.expectProcessesToNotBeAlive(registry.watcherPid))
      .then(() => expect(interceptor.output).to.be.string('watched process with PID -2 not found'));
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
      .then(() => utils.expectProcessesToNotBeAlive(registry.watcherPid))
      .then(() => expect(interceptor.output).to.be.string('parent process with PID -2 not found'));
  });

  function launchWatcher(pidRegistry) {
    return new Promise((resolve, reject) => {
      let output = '';

      const child = spawn('node', ['./lib/watchman.js'], {
        env: Object.assign({}, process.env, {PARENT_PID: registry.parentPid, WATCHED_PID: registry.childPid}),
        detached: true
      });
      pidRegistry['watcherPid'] = child.pid;

      child.stdout.on('data', data => {
        console.log(data.toString());
        output += data.toString();
        if (output.indexOf('watcher started') > -1) {
          resolve(child.pid);
        }
      });

      child.stderr.on('data', data => {
        console.log(data.toString());
        output += data.toString();
      });

      child.on('exit', code => resolve({pid: child.pid, error: Error('child exited with code ' + code)}));
      child.on('error', err => resolve({pid: child.pid, error: err}));
      child.on('message', msg => {
        if (msg === 'ready') {
          resolve({pid: child.pid});
        }
      });
    });
  }

  function launchChild(pidRegistry) {
    return new Promise((resolve, reject) => {
      let output = '';
      const child = spawn('bash',['-c', 'echo started && read']);
      pidRegistry['childPid'] = child.pid;

      child.stdout.on('data', data => {
        console.log(data.toString());
        output += data.toString();
        if (output.indexOf('started') > -1) {
          resolve(child.pid);
        }
      });

      child.on('exit', code => reject(Error('child exited with code ' + code)));
      child.on('error', err => reject(err));
    });
  }

  function launchParent(pidRegistry) {
    return new Promise((resolve, reject) => {
      let output = '';
      const child = spawn('bash',['-c', 'echo started && read']);
      pidRegistry['parentPid'] = child.pid;

      child.stdout.on('data', data => {
        console.log(data.toString());
        output += data.toString();
        if (output.indexOf('started') > -1) {
          resolve(child.pid);
        }
      });

      child.on('exit', code => reject(Error('child exited with code ' + code)));
      child.on('error', err => reject(err));
    });
  }
});