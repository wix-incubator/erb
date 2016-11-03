const expect = require('chai').expect,
  messages = require('../lib/messages');

describe('messages', () => {

  it('should match a message with origin = wix-cluster and key', () => {
    expect(messages.isWixClusterMessageWithKey({origin: 'wix-cluster', key: 'aKey'}, 'aKey')).to.equal(true);
  });

  it('should not match for mismatched messages', () => {
    expect(messages.isWixClusterMessageWithKey(undefined, 'aKey')).to.equal(false);
    expect(messages.isWixClusterMessageWithKey(null, 'aKey')).to.equal(false);
    expect(messages.isWixClusterMessageWithKey({key: 'aKey'}, 'aKey')).to.equal(false);
    expect(messages.isWixClusterMessageWithKey({origin: 'cluster', key: 'aKey'}, 'aKey')).to.equal(false);
    expect(messages.isWixClusterMessageWithKey({origin: 'wix-cluster', key: 'notKey'}, 'aKey')).to.equal(false);
  });
});