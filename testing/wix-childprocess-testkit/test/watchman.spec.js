'use strict';
const stdOutErr = require('wix-stdouterr-testkit'),
  isRunning = require('is-running'),
  spawn = require('child_process').spawn,
  expect = require('chai').use(require('chai-as-promised')).expect,
  terminate = require('terminate'),
  retry = require('promise-retry');

describe.only('watchman', function () {
  this.timeout(10000);
  let registry = {};

  beforeEach(() => {
    const killerPromises = [];
    Object.keys(registry).forEach(key => killerPromises.push(killProcess(registry[pid])));
    registry = {parentPid: process.pid};
    return Promise.all(killerPromises).catch(err => console.log(err));
  });

  it('should exit when watched process exits', () => {
    return launchChild(registry)
      .then(() => launchWatcher({parentPid: registry.parentPid, watchedPid: registry.childPid}, registry))
      .then(() => expectProcessesToBeAlive([registry.childPid]))
      .then(() => killProcess(registry.childPid))
      .then(() => retry(() => expectProcessesToNotBeAlive([registry.childPid, registry.watcherPid])));
  });

  // it('should exit if watched process is not available', () => {
  //   return launchWatcher({
  //     parentPid: process.pid,
  //     watchedPid: -2
  //   }).then(res => {
  //     expect(isRunning(res.pid)).to.equal(false);
  //     expect(res.error).to.be.defined;
  //     expect(interceptor.output).to.be.string('watched process with PID -2 not found');
  //   });
  // });
  //
  // it('should kill watched process if parent process exits', () => {
  //
  // });
  //
  // it('should suicide if parent process pid does not exist', () => {
  //
  // });
  //

  function launchWatcher(opts, pidRegistry) {
    return new Promise((resolve, reject) => {
      let output = '';

      const child = spawn('node', ['./lib/watchman.js'], {
        env: Object.assign({}, process.env, {PARENT_PID: opts.parentPid, WATCHED_PID: opts.watchedPid}),
        detached: true
      });
      pidRegistry['watcherPid'] = child.pid;

      child.stdout.on('data', data => {
        console.log(data.toString());
        output += data.toString();
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
        output += data.toString();
        if (output.indexOf('started') > -1) {
          resolve(child.pid);
        }
      });

      child.on('exit', code => reject(Error('child exited with code ' + code)));
      child.on('error', err => reject(err));
    });
  }

  function killProcess(pid) {
    return new Promise((resolve, reject) => {
      terminate(pid, (err, res) => resolve());
    });
  }

  function expectProcessesToBeAlive(processes) {
    return Promise.resolve().then(() => processes.forEach(pid => expect(isRunning(pid)).to.equal(true)));
  }

  function expectProcessesToNotBeAlive(processes) {
    return Promise.resolve().then(() => processes.forEach(pid => expect(isRunning(pid)).to.not.equal(true)));
  }


});