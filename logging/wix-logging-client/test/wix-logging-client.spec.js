'use strict';
const expect = require('chai').expect,
  mockery = require('mockery'),
  shared = require('./shared');

describe('client', () => {
  let client, exchangeClient;

  beforeEach(() => {
    exchangeClient = shared.exchangeMock();
    mockery.enable({warnOnReplace: false, warnOnUnregistered: false, useCleanCache: true});
    mockery.registerMock('wix-cluster-exchange', exchangeClient);
    client = require('..');
  });

  afterEach(() => mockery.disable());

  it('should forward logging event onto topic "wix-logging"', () => {
    let event = shared.anEvent({msg: 'log message'});
    client.write(event);

    expect(exchangeClient.topic).to.equal('wix-logging');
    expect(exchangeClient.events.length).to.equal(1);
    expect(exchangeClient.events.pop()).to.deep.equal(event);
  });

  it('should transform error into serializable form', () => {
    let error = new Error('qwe');
    let publishedEvent = shared.anEvent({error});
    let expectedEvent = shared.anEvent({
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });

    client.write(publishedEvent);

    expect(exchangeClient.events.pop()).to.deep.equal(expectedEvent);
  });
});