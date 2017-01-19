const expect = require('chai').use(require('sinon-chai')).use(require('chai-things')).expect,
  sinon = require('sinon'),
  appStopper = require('../../lib/engine/app-stopper'),
  Logger = require('wnp-debug').Logger,
  mocks = require('../support/mocks');

require('sinon-as-promised');

describe('app-stopper', () => {

  it('should successfully stop an app and exit with code 0', sinon.test(function (done) {
    const currentWorker = mocks.worker(this);
    const {currentProcess} = mocks.process();
    const log = sinon.createStubInstance(Logger);
    const stopFunction = this.stub().resolves();

    currentProcess.onExit(exitCode => {
      expect(stopFunction).to.have.been.calledOnce;
      expect(log.debug).to.have.been.calledWith(sinon.match('shutdown completed'));
      expect(exitCode).to.equal(0);
      done();
    });

    appStopper(currentProcess, currentWorker, log)(stopFunction);
  }));

  it('should exit with code -1 if app stop fails', sinon.test(function (done) {
    const currentWorker = mocks.worker(this);
    const {currentProcess} = mocks.process();
    const log = sinon.createStubInstance(Logger);
    const stopFunction = this.stub().rejects(new Error('woops'));

    currentProcess.onExit(exitCode => {
      expect(stopFunction).to.have.been.calledOnce;
      expect(log.error).to.have.been.calledWith(sinon.match('shutdown failed'), new Error('woops'));
      expect(exitCode).to.equal(-1);
      done();
    });

    appStopper(currentProcess, currentWorker, log)(stopFunction);
  }));
});