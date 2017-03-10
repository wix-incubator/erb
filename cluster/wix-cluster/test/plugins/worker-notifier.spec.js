const expect = require('chai').use(require('sinon-chai')).expect,
  sinon = require('sinon'),
  plugin = require('../../lib/plugins/worker-notifier'),
  mocks = require('../support/mocks'),
  messages = require('../../lib/messages');

describe('worker-notifier', () => {

  it('should send worker count and worker death count once worker stats listening', sinon.test(function() {
    const newWorker = mocks.worker(this, 1).worker;
    const cluster = mocks.cluster(this, [newWorker]);
    const send = this.spy();

    plugin.master(send)({cluster});

    cluster.emit('listening', newWorker);

    expect(send).to.have.been.calledWith(newWorker, messages.workerCount(1));
    expect(send).to.have.been.calledWith(newWorker, messages.workerDeathCount(0));
  }));

  it('should broadcast updated stats to all workers upon worker death', sinon.test(function() {
    const worker1 = mocks.worker(this, 1).worker;
    const worker2 = mocks.worker(this, 2).worker;
    const cluster = mocks.cluster(this, [worker1, worker2]);
    const send = this.spy();

    plugin.master(send)({cluster});

    cluster.emit('disconnect', {});

    expect(send).to.have.been.calledWith(worker1, messages.workerCount(1));
    expect(send).to.have.been.calledWith(worker1, messages.workerDeathCount(1));
    expect(send).to.have.been.calledWith(worker2, messages.workerCount(1));
    expect(send).to.have.been.calledWith(worker2, messages.workerDeathCount(1));
  }));

});
