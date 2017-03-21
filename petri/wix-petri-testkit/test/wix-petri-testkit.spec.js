const expect = require('chai').use(require('chai-as-promised')).expect,
  testkit = require('..'),
  rpcClient = require('wix-json-rpc-client'),
  petriClient = require('wix-petri-client'),
  defaultPort = require('wix-test-ports').PETRI;

describe('wix-petri-testkit', () => {
  const server = testkit.server({port: 3010}).beforeAndAfter();
  const client = (rpcClientFactory = rpcClient.factory()) => petriClient.factory(rpcClientFactory, 'http://localhost:3010').client({});
  const rpc = () => rpcClient.factory().clientFactory('http://localhost:3010/LaboratoryApi').client({});

  beforeEach(() => server.reset());

  it('should use default port 3020', () => {
    expect(testkit.server().getPort()).to.equal(3020).to.equal(defaultPort);
  });

  describe('conductExperiment', () => {
    
    it('should default to error handler if none attached', () => 
      expect(rpc().invoke('conductExperiment', 'aKey', 'fallbackValue')).to.eventually.be.rejectedWith('no onConductExperiment handler')
    );

    it('should allow to attach onConductExperiment handler', () => {
      server.onConductExperiment((key, fallback) => {
        expect(key).to.equal('aKey');
        expect(fallback).to.equal('fallbackValue');
        return 'ok';
      });

      return client()
        .conductExperiment('aKey', 'fallbackValue')
        .then(res => expect(res).to.equal('ok'));
    });
    
    it('should return overridden value', () => {
      server.onConductExperiment(() => 'stubbed-value');
      const rpcClientFactory = rpcClient.factory();
      rpcClientFactory.registerBeforeRequestHook(headers => {
        headers['x-wix-petri-ex'] = 'aKey:overridden-value';
      });

      return client(rpcClientFactory)
        .conductExperiment('aKey', 'fallbackValue')
        .then(res => expect(res).to.equal('overridden-value'));
    });

    it('should support calls with no fallback value', () => {
      server.onConductExperiment((key, fallback) => {
        expect(key).to.equal('aKey');
        expect(fallback).to.equal(null);
        return 'ok';
      });

      return client()
        .conductExperiment('aKey')
        .then(res => expect(res).to.equal('ok'));
    });
  });

  describe('conductAllInScope', () => {

    it('should default to error handler if none attached', () =>
      expect(rpc().invoke('conductAllInScope', 'aScope')).to.eventually.be.rejectedWith('no onConductAllInScope handler attached')
    );

    it('should allow to attach onConductAllInScope handler', () => {
      server.onConductAllInScope(scope => {
        expect(scope).to.equal('aScope');
        return {'key1': 'value1', 'key2': 'value2'};
      });

      return client()
        .conductAllInScope('aScope')
        .then(res => expect(res).to.deep.equal({'key1': 'value1', 'key2': 'value2'}));
    });

    it('should return overridden value', () => {
      server.onConductAllInScope(() => ({'aKey':'stubbed-value'}));
      
      const rpcClientFactory = rpcClient.factory();
      rpcClientFactory.registerBeforeRequestHook(headers => {
        headers['x-wix-petri-ex'] = 'aKey:overridden-value';
      });

      return client(rpcClientFactory)
        .conductAllInScope('aScope')
        .then(res => expect(res).to.deep.equal({'aKey': 'overridden-value'}));
    });
  });
});
