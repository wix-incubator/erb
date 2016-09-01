'use strict';
const TestkitBase = require('wix-testkit-base').TestkitBase,
  EmbeddedApp = require('./embedded-app');

module.exports.server = (app, opts, isAliveCheck) => {
  //TODO: ugly as hell, split properly
  if (typeof app === 'string') {
    const options = opts || {};
    options.args = [app].concat(options.args || []);
    return new WixChildProcessTestkit('node', options, isAliveCheck);
  } else {
    const options = opts || {};
    const launcher = app[0];
    options.args = app.slice(1).concat(options.args || []);
    return new WixChildProcessTestkit(launcher, options, isAliveCheck);
  }
};

class WixChildProcessTestkit extends TestkitBase {
  constructor(app, opts, isAliveCheck) {
    super();
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