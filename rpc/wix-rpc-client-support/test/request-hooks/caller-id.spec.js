const {expect} = require('chai'),
  enricher = require('../../lib/request-hooks/caller-id');

describe('caller-id request-hook', () => {

  const wixDomains = ['wix.com', 'wixpress.com', 'wixprod.net'];

  wixDomains.forEach(domain => {

    it(`should add header formatted to {artifactId}@{host} and ${domain} removed`, () => {
      let headers = {};
      enricher.get({namespace: 'com.wix', name: 'my-artifact', host: `my-host.aus.${domain}`})(headers);
      expect(headers['X-Wix-RPC-Caller-ID']).to.equal('my-artifact:com.wix@my-host.aus');
    });
  });

  it('should add header formatted to {artifactId}@{host} with original host because is not wix url', () => {
    let headers = {};
    enricher.get({namespace: 'com.wix', name: 'my-artifact', host: 'my-host.some.com'})(headers);
    expect(headers['X-Wix-RPC-Caller-ID']).to.equal('my-artifact:com.wix@my-host.some.com');
  });
});
