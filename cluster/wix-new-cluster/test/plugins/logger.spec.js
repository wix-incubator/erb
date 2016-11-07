const expect = require('chai').use(require('sinon-chai')).expect,
  plugin = require('../../lib/plugins/logger'),
  Logger = require('wnp-debug').Logger,
  sinon = require('sinon'),
  EventEmitter = require('events');

describe('logger plugin', () => {

  ['fork', 'online', 'listening', 'disconnect', 'exit'].forEach(evt => {
    it(`should log ${evt} events`, () => {
      const cluster = new EventEmitter();
      const log = sinon.createStubInstance(Logger);

      plugin.master(log)({cluster});

      cluster.emit(evt, {id: 1});

      expect(log.debug).to.have.been.calledWith(sinon.match(evt), 1);
    });
  });
});