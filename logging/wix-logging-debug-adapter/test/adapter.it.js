'use strict';
const testkit = require('wix-logging-adapter-testkit');

describe('adapter it', () => {
  let event = {level: 'debug', msg: 'log message is'};

  before(() => {
    process.env.DEBUG = 'cat';
  });

  it(`should log and event within worker`,done => {
    testkit.run('./test/apps/worker.js', event, done);
  });

  it(`should log and event within master`,done => {
    testkit.run('./test/apps/master.js', event, done);
  });

  it(`should log and event within express`,done => {
    testkit.run('./test/apps/express.js', event, done);
  });
});