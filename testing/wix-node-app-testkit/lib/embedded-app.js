'use strict';
const _ = require('lodash'),
  fork = require('child_process').fork,
  watcher = require('./watcher');

module.exports.embeddedApp = (app, opts, isAliveCheck) => new EmbeddedApp(app, opts, isAliveCheck);

module.exports.withinApp = (app, opts, isAliveCheck, promise) => {
  return () => {
    let instance = new EmbeddedApp(app, opts, isAliveCheck);
    return new Promise((fulfill, reject) => instance.start(err => err ? reject(err) : fulfill()))
      .then(() => promise(instance))
      .then((res) => {
        return new Promise((fulfill) => instance.stop(() => {
          instance = undefined;
          fulfill(res);
        }));
      }, (err) => {
        return new Promise((fulfill, reject) => instance.stop(() => {
          instance = undefined;
          reject(err);
        }));
      });
  };
};

function EmbeddedApp(app, opts, isAliveCheck) {
  const env = opts.env;
  const check = isAliveCheck;
  let stdout = [];
  let stderr = [];
  let stopped = false;
  let cleanupWatcher = _.noop;

  const timeout = opts.timeout || 4000;
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

  this.start = done => {
    const cb = _.once(done);
    stopped = false;
    child = fork(app, [], {silent: true, env});

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
  };

  this.stop = done => {
    cleanupWatcher();
    if (stopped === true) {
      done();
    } else {
      child.on('exit', () => done());
      child.kill();
    }
  };

  this.beforeAndAfter = () => {
    before(done => this.start(done));
    after(done => {
      this.stop(() => {
        this.clearStdOutErr();
        done();
      });
    });
  };


  this.beforeAndAfterEach = () => {
    beforeEach(done => this.start(done));
    afterEach(done => {
      this.stop(() => {
        this.clearStdOutErr();
        done();
      });
    });
  };

  this.clearStdOutErr = () => {
    stdout = [];
    stderr = [];
  };

  this._removeWatcher = () => cleanupWatcher();

  this.stdout = () => stdout;
  this.stderr = () => stderr;
}