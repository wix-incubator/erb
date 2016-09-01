'use strict';
const _ = require('lodash'),
  spawn = require('child_process').spawn,
  runWatcher = require('./watchman-runner'),
  retry = require('retry-promise').default;

function EmbeddedApp(app, opts, isAliveCheck) {
  const check = isAliveCheck;
  const env = Object.assign({}, process.env, opts.env || {});

  let stdout = [];
  let stderr = [];
  const timeout = opts.timeout || 10000;
  const checkStepDuration = 100;

  let child;

  function context() {
    return {
      env,
      stdout: () => stdout,
      stderr: () => stderr
    };
  }

  function awaitStartup(timeSpent, cb) {
    if (timeSpent > timeout) {
      cb(Error(`Timeout of ${timeout} exceeded while waiting for embedded app ${app} to start.`));
    } else {
      setTimeout(() => {
        check.invoke(context(), () => cb(), () => awaitStartup(timeSpent + checkStepDuration, cb));
      }, checkStepDuration);
    }
  }

  this.start = done => {
    const cb = _.once(done);
    child = spawn(app, opts.args || [], {
      execArgv: process.execArgv.concat(opts.execArgv || []),
      silent: true,
      env: env
    });

    child.stderr.on('data', data => {
      console.error(data.toString());
      stderr.push(data.toString());
    });

    child.stdout.on('data', data => {
      console.info(data.toString());
      stdout.push(data.toString());
    });

    child.on('exit', code => cb(Error('Program exited during startup with code: ' + code)));
    child.on('error', err => cb(err));

    runWatcher({parentPid: process.pid, watchedPid: child.pid});
    awaitStartup(0, cb);
  };

  this.stop = done => {
    child.kill();
    retry(() => new Promise((resolve, reject) => {
      try {
        process.kill(child.pid, 0);
        reject(Error('process still running'));
      }
      catch (e) {
        resolve();
      }

    }))
      .then(done)
      .catch(done);
  };

  this.clearStdOutErr = () => {
    stdout = [];
    stderr = [];
  };

  this.stdout = () => stdout;
  this.stderr = () => stderr;
  this.child = () => child;
}

module.exports = EmbeddedApp;