const expect = require('chai').use(require('sinon-chai')).use(require('chai-things')).expect,
  sinon = require('sinon'),
  appLauncher = require('../../lib/engine/app-launcher'),
  messages = require('../../lib/messages'),
  mocks = require('../support/mocks');

describe('app-launcher', () => {

  it('should launch an app, send message to master and return result', sinon.test(function () {
    const currentWorker = mocks.worker(this);
    const {currentProcess, collectedMessages} = mocks.process();
    const appFunction = this.stub().returns('ok');

    return appLauncher(appFunction, currentProcess, currentWorker).then(stop => {
      expect(appFunction).to.have.been.calledOnce;
      expect(stop).to.equal('ok');
      expect(collectedMessages).to.contain.an.item.that.deep.equals(messages.workerStarted(currentWorker.id));
    });
  }));

  it('should send message to master on sync failure and exit process', sinon.test(function (done) {
    const currentWorker = mocks.worker(this);
    const {currentProcess, collectedMessages} = mocks.process();
    const appFunction = this.stub().throws(new Error('woops'));

    currentProcess.onExit(value => {
      expect(appFunction).to.have.been.calledOnce;
      expect(value).to.equal(-1);
      expect(collectedMessages).to.contain.an.item.that.satisfies(messages.isWorkerFailed);
      done();
    });

    appLauncher(appFunction, currentProcess, currentWorker);
  }));
});