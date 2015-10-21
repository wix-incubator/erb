'use strict';
const _ = require('lodash'),
  mockery = require('mockery'),
  shared = require('./shared'),
  expect = require('chai').expect;

describe('hooks', () => {
  let client, exchangeClient;

  beforeEach(() => {
    exchangeClient = shared.exchangeMock();
    mockery.enable({warnOnReplace: false, warnOnUnregistered: false, useCleanCache: true});
    mockery.registerMock('wix-cluster-exchange', exchangeClient);
    client = require('..');
  });

  afterEach(() => mockery.disable());

  it('should allow me to register an metadata enrichment hook', () => {
    new FakeEnricher().addTo(client);
  });

  it('should apply enricher hook onto logging event before sending further', () => {
    let enricher = new FakeEnricher({fakeMeta: 'fakeMetaValue'});
    let publishedEvent = shared.anEvent();
    let expectedEvent = _.merge(_.cloneDeep(publishedEvent), {fakeMeta: 'fakeMetaValue'});

    enricher.addTo(client);

    client.write(publishedEvent);
    expect(exchangeClient.events.pop()).to.deep.equal(expectedEvent);
  });

  it('should apply multiple enrichers onto logging event before sending further', () => {
    let enricher1 = new FakeEnricher({fakeMeta: 'fakeMetaValue'});
    let enricher2 = new FakeEnricher({fakeMeta2: 'fakeMetaValue2'});

    let publishedEvent = shared.anEvent();
    let expectedEvent = _.merge(_.cloneDeep(publishedEvent), {fakeMeta: 'fakeMetaValue', fakeMeta2: 'fakeMetaValue2'});

    enricher1.addTo(client);
    enricher2.addTo(client);

    client.write(publishedEvent);
    expect(exchangeClient.events.pop()).to.deep.equal(expectedEvent);
  });

});

function FakeEnricher(meta) {
  function enrich(event) {
    return _.merge(event, meta);
  }

  this.addTo = client => {
    client.registerMetadataEnrichmentHook(enrich);
  };
}