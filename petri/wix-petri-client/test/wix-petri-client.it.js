'use strict';
const expect = require('chai').expect,
  petriClient = require('..'),
  rpcClient = require('wix-json-rpc-client'),
  rpcTestkit = require('wix-rpc-testkit');

describe('wix-petri-client it', () => {
  const rpcServer = new RpcServer().beforeAndAfter();
  const client = () => petriClient.factory(rpcClient.factory(), `http://localhost:${rpcServer.getPort()}`).client({});

  beforeEach(() => rpcServer.reset());

  describe('conductExperiment', () => {

    it('should pass-on key and fallbackValue to laboratory server and return a response', () => {
      rpcServer.onConductExperiment((params, respond) => {
        expect(params).to.deep.equal(['aKey', 'fallbackValue']);
        respond({result: 'ok'});
      });

      return client()
        .conductExperiment('aKey', 'fallbackValue')
        .then(res => expect(res).to.equal('ok'));
    });
  });

  describe('conductAllInScope', () => {

    it('should pass-on scope to laboratory server and return a response', () => {
      rpcServer.onConductAllInScope((params, respond) => {
        expect(params).to.deep.equal(['aScope']);
        respond({result: {'key1': 'value1', 'key2': 'value2'}});
      });

      return client()
        .conductAllInScope('aScope')
        .then(res => expect(res).to.deep.equal({'key1': 'value1', 'key2': 'value2'}));
    });
  });


  function RpcServer() {
    const rpcServer = rpcTestkit.server();
    const defaultResponse = {error: {code: 121212, message: 'not handled'}};
    let conductExperimentHandler = () => defaultResponse;
    let conductAllInScopeHandler = () => defaultResponse;

    this.onConductExperiment = handler => conductExperimentHandler = handler;
    this.onConductAllInScope = handler => conductAllInScopeHandler = handler;
    this.reset = () => conductExperimentHandler = () => defaultResponse;
    this.getPort = () => rpcServer.getPort();
    this.beforeAndAfter = () => {
      rpcServer.beforeAndAfter();
      return this;
    };

    rpcServer.addHandler('LaboratoryApi', (req, res) => {
      res.rpc('conductExperiment', (params, respond) => conductExperimentHandler(params, respond));
      res.rpc('conductAllInScope', (params, respond) => conductAllInScopeHandler(params, respond));
    });
  }

});