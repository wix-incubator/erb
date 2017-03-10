const expect = require('chai').expect,
  enricher = require('../../lib/request-hooks/caller-id');

describe('caller-id request-hook', () => {

  it('should add header formatted to {artifactId}@{host} and wixpress.com removed', () => {
    let headers = {};
    enricher.get({artifactId: 'my-artifact', host: 'my-host.aus.wixpress.com'})(headers);
    expect(headers['X-Wix-RPC-Caller-ID']).to.equal('my-artifact@my-host.aus');
  });

  it('should add header formatted to {artifactId}@{host} and wix.com removed', () => {
    let headers = {};
    enricher.get({artifactId: 'my-artifact', host: 'my-host.aus.wix.com'})(headers);
    expect(headers['X-Wix-RPC-Caller-ID']).to.equal('my-artifact@my-host.aus');
  });

  it('should add header formatted to {artifactId}@{host} with original host because is not wix url', () => {
    let headers = {};
    enricher.get({artifactId: 'my-artifact', host: 'my-host.some.com'})(headers);
    expect(headers['X-Wix-RPC-Caller-ID']).to.equal('my-artifact@my-host.some.com');
  });

});
