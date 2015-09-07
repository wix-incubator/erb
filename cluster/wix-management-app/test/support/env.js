'use strict';
const fork = require('child_process').fork;

module.exports.within = function (app, env) {
  var child = new EmbeddedApp(app, env);
  beforeEach((done) => {
    child.start(done);
  });
  afterEach((done) => {
    child.stop(done);
  });
};

module.exports.withinEnv = (app, env, promise) => {
  return () => {
    const instance = new EmbeddedApp(app, env);
    return new Promise((fulfill) => instance.start(fulfill))
      .then(() => promise(instance))
      .then((res) => {
        return new Promise((fulfill) => instance.stop(() => fulfill(res)));
      }, (err) => {
        return new Promise((fulfill, reject) => instance.stop(() => reject(err)));
      } );
  };
};

function EmbeddedApp(app, env) {

  this.start = (done) => {
    this.child = fork(`./test/apps/${app}.js`, [], {env: env});

    this.child.on('message', (msg) => {
      if (msg === 'running') {
        done();
      }
    });
  };

  this.stop = (done) => {
    this.child.on('exit', () => {
      done();
    });
    this.child.kill();
  };

  this.pid = function() {
    return this.child.pid;
  };
}