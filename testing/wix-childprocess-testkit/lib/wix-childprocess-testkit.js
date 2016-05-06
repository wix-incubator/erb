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
    assertAppFileExists(app);
    assertDefined(isAliveCheck, 'alive check was not provided - did you pass-in all arguments?');
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

  child() {
    return this.app.child();
  }
}

function assertDefined(what, msg) {
  if (!what) {
    throw new Error(msg);
  }
}

function assertAppFileExists() {
  //TODO: works strangely within and outside of module.
  //fs.accessSync(__dirname + '/' + path + '.js', fs.R_OK);
}

function EmbeddedApp(app, opts, isAliveCheck) {
  const check = isAliveCheck;
  const env = Object.assign({}, process.env, opts.env || {});

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
    child = fork(join(__dirname, 'launcher.js'), opts.args || [], {
      execArgv: process.execArgv.concat(opts.execArgv || []),
      silent: true,
      env: _.merge({}, env, {APP_TO_LAUNCH: app, APP_TO_LAUNCH_TIMEOUT: timeout})
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
      cleanupWatcher();
      cb(Error('Program exited during startup with code: ' + code));
    });

    child.on('error', err => {
      cleanupWatcher();
      cb(err);
    });

    cleanupWatcher = _.once(watcher.installOnMaster(app, child));
    awaitStartup(0, err => {
      if (err) {
        cleanupWatcher();
      }
      cb(err);
    });
  };

  function isProcessAlive(server) {
    try {
      process.kill(server.child().pid, 0);
      return true;
    } catch (e) {
      return false;
    }
  }

  this.stop = done => {
    child.on('exit', () => {
      cleanupWatcher();
      done();
    });
    child.kill();
    if (isProcessAlive()) {
      this.child.kill();
    } else {
      cleanupWatcher();
      done();
    }
  };

  this.clearStdOutErr = () => {
    stdout = [];
    stderr = [];
  };

  this.stdout = () => stdout;
  this.stderr = () => stderr;
  this.child = () => child;
}