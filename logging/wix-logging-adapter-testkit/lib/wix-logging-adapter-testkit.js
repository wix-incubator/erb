'use strict';
const expect = require('chai').expect,
  fork = require('child_process').fork,
  request = require('request');

module.exports = require('./scenarios');

module.exports.run = (app, msg, done) => {
  let application = new EmbeddedApp(app);
  application.start(startEvtType => {
    if (startEvtType === 'cluster-online') {
      verify(application, msg, done);
    } else {
      request('http://localhost:3000', function (error, response) {
        application.stop(done);
        expect(error).to.be.null;
        expect(response.statusCode).to.equal(200);
        verify(application, msg, done);
      });
    }
  });
};
//TODO: add proper error handling, sanitize timeout, overall impl.
function verify(application, msg, done) {
  setTimeout(() => {
    application.stop(done);
    expect(application.stdout.length).to.equal(1);
    expect(application.stdout[0]).to.be.a.string(msg.level.toUpperCase());
    expect(application.stdout[0]).to.be.a.string(msg.msg);
  }, 2000);
}

function EmbeddedApp(app) {
  let child;

  this.stdout = [];
  this.stderr = [];

  this.start = done => {
    child = fork(app, [], {silent: true});

    child.on('message', msg => {
      if (msg === 'cluster-online' || msg === 'cluster-listening') {
        done(msg);
      }
    });

    child.stdout.on('data', data => {
      console.log(data.toString());
      this.stdout.push(data.toString());
    });

    child.stderr.on('data', data => {
      console.log(data.toString());
      this.stderr.push(data.toString());
    });
  };

  this.stop = done => {
    child.on('exit', () => {
      done();
    });

    child.kill('SIGKILL');
  };
}