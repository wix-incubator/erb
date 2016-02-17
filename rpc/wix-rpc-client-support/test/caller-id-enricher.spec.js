'use strict';
const chai = require('chai'),
  expect = chai.expect,
  callerIdEnricher = require('../lib/enrichers/caller-id-enricher');

describe('caller id enricher', () => {

  it('should enrich formatted to {artifactId}@{host} and wixpress.com removed', () => {
    let headers = {};
    callerIdEnricher.get({artifactId: 'my-artifact', host: 'my-host.aus.wixpress.com'})(headers);
    expect(headers['X-Wix-RPC-Caller-ID']).to.equal('my-artifact@my-host.aus');
  });

  it('should enrich formatted to {artifactId}@{host} and wix.com removed', () => {
    let headers = {};
    callerIdEnricher.get({artifactId: 'my-artifact', host: 'my-host.aus.wix.com'})(headers);
    expect(headers['X-Wix-RPC-Caller-ID']).to.equal('my-artifact@my-host.aus');
  });

  it('should enrich formatted to {artifactId}@{host} with original host because is not wix url', () => {
    let headers = {};
    callerIdEnricher.get({artifactId: 'my-artifact', host: 'my-host.some.com'})(headers);
    expect(headers['X-Wix-RPC-Caller-ID']).to.equal('my-artifact@my-host.some.com');
  });

});
