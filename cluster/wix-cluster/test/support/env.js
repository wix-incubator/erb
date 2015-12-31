'use strict';
const fork = require('child_process').fork,
  _ = require('lodash');

module.exports.withinEnv = (app, settings, promise) => {
  return () => {
    const instance = new EmbeddedApp(app, settings);
    return new Promise(fulfill => instance.start(fulfill))
      .then(() => promise(instance))
      .then(
        res => new Promise(fulfill => instance.stop(() => fulfill(res))),
        err => new Promise((fulfill, reject) => instance.stop(() => reject(err)))
      );
  };
};

function EmbeddedApp(app, settings) {
  var workerCount = settings.workerCount;
  var spawnedWorkerCount = 0;
  var events = [];

  this.start = done => {
    this.child = fork(`./test/apps/${app}.js`, [], {env: settings});

    this.child.on('message', evt => {
      events.push(evt);

      if (evt.event === 'listening') {
        spawnedWorkerCount += 1;
        if (spawnedWorkerCount === workerCount) {
          done();
        }
      }
    });
  };

  this.stop = done => {
    this.child.on('exit', () => done());
    this.child.kill();
  };

  this.disconnectedWorkerCount = () => _.countBy(events, evt => evt.event === 'disconnect').true || 0;
  this.forkerWorkerCount = () => _.countBy(events, evt => evt.event === 'fork').true || 0;
}