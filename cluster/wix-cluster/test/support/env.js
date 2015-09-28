'use strict';
const fork = require('child_process').fork,
  _ = require('lodash');

module.exports.withinEnv = (app, settings, promise) => {
  return () => {
    const instance = new EmbeddedApp(app, settings);
    return new Promise((fulfill) => instance.start(fulfill))
      .then(() => promise(instance))
      .then((res) => {
        return new Promise((fulfill) => instance.stop(() => fulfill(res)));
      }, (err) => {
        return new Promise((fulfill, reject) => instance.stop(() => reject(err)));
      } );
  };
};

function EmbeddedApp(app, settings) {
  var workerCount = settings.workerCount;
  var spawnedWorkerCount = 0;
  var events = [];

  this.start = (done) => {
    this.child = fork(`./test/apps/${app}.js`, [], {env: settings});

    this.child.on('message', (evt) => {
      events.push(evt);

      if (evt.event === 'listening') {
        spawnedWorkerCount += 1;
        if (spawnedWorkerCount === workerCount) {
          done();
        }
      }
    });
  };

  this.stop = (done) => {
    this.child.on('exit', () => {
      done();
    });
    this.child.kill();
  };

  this.disconnectedWorkerCount = () => {
    return _.countBy(events, (evt) => {
      return evt.event === 'disconnect';
    }).true;
  };

  this.forkerWorkerCount = () => {
    return _.countBy(events, (evt) => {
      return evt.event === 'fork';
    }).true;
  };
}