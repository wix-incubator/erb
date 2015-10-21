'use strict';
const expect = require('chai').expect,
  env = require('./support/env'),
  format = require('date-format');

describe('plugin', () => {
  const now = new Date(),
    timestamp = now.getTime(),
    dateStr = format.asString('hh:mm:ss.SSS', now);

  it('should log events received from client app to stdout', done => {
    env.withinApp('./test/apps/basic', {timestamp: timestamp, level: 'info'}, (app, cb) => {
      expect(app.stdout.pop()).to.equal(`${dateStr} INFO category=[cat] log message\n`);
      cb(done);
    });
  });

  it('should log events received from client app to stderr', done => {
    env.withinApp('./test/apps/basic', {timestamp: timestamp, level: 'error'}, (app, cb) => {
      expect(app.stderr.pop()).to.equal(`${dateStr} ERROR category=[cat] log message\n`);
      cb(done);
    });
  });
});