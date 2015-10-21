'use strict';
const _ = require('lodash'),
  fork = require('child_process').fork;

exports.anEmbeddedApp = (app, env) => {
  return new EmbeddedApp(app, env);
};

exports.withinApp = (appStr, env, cb) => {
  let app = new EmbeddedApp(appStr, env);
  app.start(() => {
    cb(app, app.stop);
  });
};

function EmbeddedApp(app, env) {
  let environment = env,
    child;

  this.stdout = [];
  this.stderr = [];

  this.start = done => {
    child = fork(`${app}.js`, [], { silent: true, env: _.merge(process.env, environment) });

    child.on('message', msg => {
      if (msg === 'cluster-online') {
        done();
      }
    });

    child.stdout.on('data', data => {
      console.log(data.toString());
      this.stdout.push(data.toString());
    });

    child.stderr.on('data', data => {
      console.error(data.toString());
      this.stderr.push(data.toString());
    });
  };

  this.stop = done => {
    child.on('exit', () => {
      done();
    });

    child.kill();
  };
}