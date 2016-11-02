const expect = require('chai').expect,
  messages = require('../lib/messages');

describe('messages', () => {

  it('should match a message with origin = wix-cluster and key', () => {
    expect(messages.isMessageFromWorkerFor({origin: 'wix-cluster', key: 'aKey'}, 'aKey')).to.equal(true);
  });

  it('should not match for mismatched messages', () => {
    expect(messages.isMessageFromWorkerFor(undefined, 'aKey')).to.equal(false);
    expect(messages.isMessageFromWorkerFor(null, 'aKey')).to.equal(false);
    expect(messages.isMessageFromWorkerFor({key: 'aKey'}, 'aKey')).to.equal(false);
    expect(messages.isMessageFromWorkerFor({origin: 'cluster', key: 'aKey'}, 'aKey')).to.equal(false);
    expect(messages.isMessageFromWorkerFor({origin: 'wix-cluster', key: 'notKey'}, 'aKey')).to.equal(false);
  });
});