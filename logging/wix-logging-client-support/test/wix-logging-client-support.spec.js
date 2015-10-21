'use strict';
const expect = require('chai').expect,
  mockery = require('mockery'),
  shared = require('./shared');

describe('logging-client-support', () => {
  let client, support;

  beforeEach(() => {
    mockery.enable({warnOnReplace: false, warnOnUnregistered: false, useCleanCache: true});
    mockery.registerMock('wix-req-context', new FakeReqContext());
    client = shared.fakeClient();
    support = require('..');
  });

  afterEach(() => mockery.disable());

  it('adds a hook to a "wix-logging-client"', () => {
    support.addTo(client);

    expect(client.hooks.length).to.equal(1);
  });

  //TODO: add additional metadata
  it('injects metadata from "wix-req-context"', () => {
    support.addTo(client);

    expect(client.apply({})).to.contain.deep.property('req.requestId', '123');
  });

  it('replaces existing metadata from "wix-req-context"', () => {
    support.addTo(client);

    expect(client.apply({req: {requestId: '235'}})).to.contain.deep.property('req.requestId', '123');
  });

});

function FakeReqContext() {
  this.get = () => {
    return {
      requestId: '123'
    };
  };
}
