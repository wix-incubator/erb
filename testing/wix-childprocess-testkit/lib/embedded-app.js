'use strict';
const _ = require('lodash'),
  fork = require('child_process').fork,
  watcher = require('./watcher'),
  join = require('path').join;

module.exports.embeddedApp = (app, opts, isAliveCheck) => new EmbeddedApp(app, opts, isAliveCheck);

function EmbeddedApp(app, opts, isAliveCheck) {
  const env = opts.env;
  const check = isAliveCheck;
  let stdout = [];
  let stderr = [];
  let stopped = false;
  let cleanupWatcher = _.noop;

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

  this.env = env;

  function start(done) {
    const cb = _.once(done);
    stopped = false;
    child = fork(join(__dirname, 'launcher.js'), [], {silent: true, env: _.merge(_.clone(env, true), {APP_TO_LAUNCH: app, APP_TO_LAUNCH_TIMEOUT: timeout})});

    child.stdout.on('data', data => {
      console.info(data.toString());
      stdout.push(data.toString());
    });

    child.stderr.on('data', data => {
      console.error(data.toString());
      stderr.push(data.toString());
    });

    child.on('exit', code => {
      stopped = true;
      if (code !== 0) {
        cb(Error('Program exited with code: ' + code));
      }
    });

    child.on('error', err => {
      stopped = true;
      cb(err);
    });

    awaitStartup(0, err => {
      cleanupWatcher = watcher.installOnMaster(child);
      cb(err);
    });
  }

  function stop(done) {
    cleanupWatcher();
    if (stopped === true) {
      done();
    } else {
      child.on('exit', () => done());
      child.kill();
    }
  }

  this.start = () => {
    return new Promise((resolve, reject) => start(err => err ? reject(err) : resolve()));
  };

  this.stop = () => {
    return new Promise((resolve, reject) => stop(err => err ? reject(err) : resolve()));
  };

  this.beforeAndAfter = () => {
    before(() => this.start());
    after(() => this.stop().then(() => this.clearStdOutErr()));
  };

  this.beforeAndAfterEach = () => {
    beforeEach(() => this.start());
    after(() => this.stop().then(() => this.clearStdOutErr()));
  };

  this.clearStdOutErr = () => {
    stdout = [];
    stderr = [];
  };

  this.stdout = () => stdout;
  this.stderr = () => stderr;
}