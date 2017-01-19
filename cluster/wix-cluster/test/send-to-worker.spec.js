const expect = require('chai').use(require('sinon-chai')).expect,
  sinon = require('sinon'),
  Logger = require('wnp-debug').Logger,
  sendToWorker = require('../lib/send-to-worker');

describe('send-to-worker', () => {
  it('should send a message to a worker', () => {
    const log = aLog();
    const worker = aWorker();

    sendToWorker(log)(worker, 'msg');

    expect(worker.send).to.have.been.calledWith('msg');
  });

  it('should not send if worker is dead', () => {
    const log = aLog();
    const worker = aWorker();

    worker.isDead.returns(true);

    sendToWorker(log)(worker, 'msg');

    expect(worker.send).to.not.have.been.called;
    expect(log.error).to.not.have.been.called;
  });

  it('should not send if worker is not connected', () => {
    const log = aLog();
    const worker = aWorker();

    worker.isConnected.returns(false);

    sendToWorker(log)(worker, 'msg');

    expect(worker.send).to.not.have.been.called;
    expect(log.error).to.not.have.been.called;
  });

  it('should log error if send fails', () => {
    const log = aLog();
    const worker = aWorker();
    worker.send.throws(new Error('woops'));

    sendToWorker(log)(worker, 'msg');

    expect(log.error).to.have.been.calledWithMatch('failed sending message', worker.id, new Error('woops'));
  });


  function aLog() {
    return sinon.createStubInstance(Logger);
  }

  function aWorker() {
    const worker = sinon.stub();
    worker.id = 1;
    worker.isConnected = sinon.stub().returns(true);
    worker.isDead = sinon.stub().returns(false);
    worker.send = sinon.stub();
    return worker;
  }

});