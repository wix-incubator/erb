const expect = require('chai').use(require('sinon-chai')).expect,
  sinon = require('sinon'),
  plugin = require('../../lib/plugins/message-broadcaster'),
  mocks = require('../support/mocks'),
  messages = require('../../lib/messages');

describe('message-broadcaster', () => {

  it('should re-broadcast messages to workers', sinon.test(function() {
    const worker1 = mocks.worker(this, 1);
    const worker2 = mocks.worker(this, 2);
    const cluster = mocks.cluster(this, [worker1, worker2]);
    const sendToWorker = this.spy();

    plugin.master(sendToWorker)({cluster});

    const msg = messages.broadcast('aMessage');
    cluster.emit('message', {}, msg);

    expect(sendToWorker).to.have.been.calledWith(worker1, msg);
    expect(sendToWorker).to.have.been.calledWith(worker2, msg);
  }));
});