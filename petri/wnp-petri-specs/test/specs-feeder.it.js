const testkit = require('wix-jvm-bootstrap-testkit'),
  http = require('wnp-http-test-client'),
  expect = require('chai').expect,
  rpcClient = require('wix-json-rpc-client'),
  SpecsFeeder = require('../lib/specs-feeder'),
  rpcClientSupport = require('wix-rpc-client-support'),
  specs = require('./specs-fixture').all;

describe('SpecsFeeder.send', function() {
  
  this.timeout(60000);

  const server = testkit.server({
    artifact: {
      groupId: 'com.wixpress.node',
      artifactId: 'wix-spjs-test-server',
      version: '1.0.0-SNAPSHOT'
    }
  }).beforeAndAfter();

  it('should send specs over RPC', () => {
    return aClient().send(specs)
      .then(fetchSentSpecs)
      .then(result => {
        expect(result).to.have.deep.property('[0].key', 'spec1');
        expect(result).to.have.deep.property('[1].key', 'spec2');
      });
  });
  
  it('should return an array of sent spec keys', () => {
    return aClient().send(specs)
      .then(result => expect(result).to.deep.equal(['spec1', 'spec2']));
  });

  function fetchSentSpecs() {
    return http.okGet(server.getUrl('/api/petri/sync-specs'))
      .then(r => r.json())
  }

  function aClient() {
    const factory = rpcClient.factory();
    rpcClientSupport.get({rpcSigningKey: rpcClientSupport.devSigningKey}).addTo(factory);
    return new SpecsFeeder(factory, `http://localhost:${server.getPort()}`);
  }
});
