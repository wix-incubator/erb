'use strict';
const _ = require('lodash'),
  fork = require('child_process').fork,
  watcher = require('./watcher'),
  join = require('path').join,
  TestkitBase = require('wix-testkit-base').TestkitBase;

module.exports.server = (app, opts, isAliveCheck) => new WixChildProcessTestkit(app, opts, isAliveCheck);

class WixChildProcessTestkit extends TestkitBase {
  constructor(app, opts, isAliveCheck) {
    super();
    this.app = new EmbeddedApp(app, opts, isAliveCheck);
  }

  doStart() {
    this.app.clearStdOutErr();
    return new Promise((resolve, reject) =>
      this.app.start(err => err ? reject(err) : resolve())
    );
  }

  doStop() {
    return new Promise((resolve, reject) =>
      this.app.stop(err => err ? reject(err) : resolve())
    );
  }

  stdout() {
    return this.app.stdout();
  }

  stderr() {
    return this.app.stderr();
  }
}

function EmbeddedApp(app, opts, isAliveCheck) {
  const check = isAliveCheck;
  const env = opts.env;

  let stdout = [];
  let stderr = [];
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



  this.start = done => {
    const cb = _.once(done);
    child = fork(join(__dirname, 'launcher.js'), [], {
      silent: true,
      env: _.merge(_.clone(env, true), {APP_TO_LAUNCH: app, APP_TO_LAUNCH_TIMEOUT: timeout})
    });

    child.stdout.on('data', data => {
      console.info(data.toString());
      stdout.push(data.toString());
    });

    child.stderr.on('data', data => {
      console.error(data.toString());
      stderr.push(data.toString());
    });

    child.on('exit', code => {
      if (code !== 0) {
        cb(Error('Program exited with code: ' + code));
      }
    });

    child.on('error', err => {
      cb(err);
    });

    awaitStartup(0, err => {
      cleanupWatcher = watcher.installOnMaster(child);
      cb(err);
    });
  };

  this.stop = done => {
    cleanupWatcher();
    child.on('exit', () => done());
    child.kill();
  };

  this.clearStdOutErr = () => {
    stdout = [];
    stderr = [];
  };

  this.stdout = () => stdout;
  this.stderr = () => stderr;
}