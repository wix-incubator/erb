'use strict';
const fork = require('child_process').fork,
  _ = require('lodash');

module.exports.app = (app, settings) => new EmbeddedApp(app, settings);

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

function EmbeddedApp(app, options) {
  const opts = options || {};
  var workerCount = opts.workerCount || 2;
  var spawnedWorkerCount = 0;
  var events = [];
  this.output = '';

  this.start = done => {
    const cb = _.once(done);
    this.child = fork(`./test/apps/${app}.js`, [], {silent: true, env: _.merge({}, process.env, opts)});

    this.child.stdout.on('data', msg => {
      console.log(msg.toString());
      this.output += msg.toString();
    });

    this.child.stderr.on('data', msg => {
      console.error(msg.toString());
      this.output += msg.toString();
    });

    this.child.on('message', evt => {
      events.push(evt);

      if (evt.event === 'listening') {
        spawnedWorkerCount += 1;
        if (spawnedWorkerCount === workerCount) {
          cb();
        }
      }

      if (evt.event === 'start-completed' && evt.err) {
        cb();
      }
    });
  };

  this.stop = done => {
    this.child.on('exit', () => done());
    this.child.kill();
  };

  this.events = () => events;
  this.disconnectedWorkerCount = () => _.countBy(events, evt => evt.event === 'disconnect').true || 0;
  this.forkerWorkerCount = () => _.countBy(events, evt => evt.event === 'fork').true || 0;
}