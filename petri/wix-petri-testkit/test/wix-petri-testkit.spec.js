'use strict';
const expect = require('chai').use(require('chai-as-promised')).expect,
  testkit = require('..'),
  rpcClient = require('wix-json-rpc-client'),
  petriClient = require('wix-petri-client');

describe('wix-petri-testkit', () => {
  const server = testkit.server({port: 3010}).beforeAndAfter();
  const client = () => petriClient.factory(rpcClient.factory(), `http://localhost:3010`).client({});

  beforeEach(() => server.reset());

  it('should use default port 3020', () => {
    expect(testkit.server().getPort()).to.equal(3020);
  });

  describe('conductExperiment', () => {
    it('should default to error handler if none attached', () =>
      expect(client().conductExperiment('aKey')).to.eventually.be.rejectedWith('no onConductExperiment handler attached')
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
      expect(client().conductAllInScope('aScope')).to.eventually.be.rejectedWith('no onConductAllInScope handler attached')
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
  });
});
