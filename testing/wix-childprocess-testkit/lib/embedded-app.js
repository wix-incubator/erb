'use strict';
const spawn = require('child_process').spawn,
  runWatcher = require('./watchman-runner'),
  retry = require('retry-promise').default,
  assert = require('assert'),
  TestkitBase = require('wix-testkit-base').TestkitBase;

class EmbeddedApp extends TestkitBase {
  constructor(cmdAndArgs, opts, isAliveCheck) {
    super();
    assert(isAliveCheck, 'alive check was not provided - did you pass-in all arguments?');

    this._cmdAndArgs = cmdAndArgs;
    this._check = isAliveCheck;
    this._env = Object.assign({}, process.env, opts.env || {});
    this._output = '';
    this._timeout = opts.timeout || 10000;
    this._child = undefined;
    this._isRunning = false;
  }

  _logAndAppend(log, buffer) {
    log(buffer.toString());
    this._output += buffer.toString();
  }

  doStart() {
    return new Promise((resolve, reject) => {
      this._child = spawn(this._cmdAndArgs[0], this._cmdAndArgs.slice(1), {
        silent: true,
        env: this._env
      });
      runWatcher({parentPid: process.pid, watchedPid: this._child.pid});

      this._child.stderr.on('data', data => this._logAndAppend(console.error, data));
      this._child.stdout.on('data', data => this._logAndAppend(console.info, data));
      this._child.on('exit', code => {
        this._isRunning = false;
        reject(Error('Program exited during startup with code: ' + code))
      });
      this._child.on('error', reject);

      this._runIsAlive()
        .then(() => this._isRunning = true)
        .then(resolve)
        .catch(e => {
          this._child.removeAllListeners('exit', 'error');
          return this._killAndWait()
            .then(() => reject(e))
            .catch(() => reject(e))
        });
    });
  };

  doStop() {
    return this._killAndWait();
  }

  kill(signal) {
    this._child.kill(signal);
  }
  
  get output() {
    return this._output;
  }

  get child() {
    return this._child;
  }

  get isRunning() {
    return this._isRunning;
  }
  
  _runIsAlive() {
    return retry({max: 10, backoff: this._timeout / 10},
      () => this._check({env: this._env, output: this._output}))
      .then()
      .catch(e => {
        throw new Error(`Alive check failed within timeout of ${this._timeout} and error: ${e}`);
      })
  }

  _killAndWait() {
    return Promise.resolve()
      .then(() => this._child.kill('SIGKILL'))
      .then(() => retry({max: 5, backoff: 500}, () => new Promise((resolve, reject) => {
        try {
          process.kill(this._child.pid, 0);
          reject(Error('process still running'));
        }
        catch (e) {
          resolve();
        }
      })));
  }
}

module.exports = EmbeddedApp;

