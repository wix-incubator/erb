'use strict';
const expect = require('chai').use(require('chai-as-promised')).use(require('sinon-chai')).expect,
  petriClient = require('..'),
  rpcClient = require('wix-json-rpc-client'),
  rpcTestkit = require('wix-rpc-testkit'),
  sinon = require('sinon'),
  Logger = require('wnp-debug').Logger;

describe('wix-petri-client it', () => {
  const rpcServer = new RpcServer().beforeAndAfter();

  beforeEach(() => rpcServer.reset());

  describe('conductExperiment', () => {

    it('should pass-on key and fallbackValue to laboratory server and return a response', () => {
      rpcServer.onConductExperiment((params, respond) => {
        expect(params).to.deep.equal(['aKey', 'fallbackValue']);
        respond({result: 'ok'});
      });
      const {client} = setup();

      return client()
        .conductExperiment('aKey', 'fallbackValue')
        .then(res => expect(res).to.equal('ok'));
    });
    
    it('should write warning to log if used without fallback value', () => {
      rpcServer.onConductExperiment((params, respond) => {
        respond({result: 'ok'});
      });
      const {client, log} = setup();
      
      return client()
        .conductExperiment('aKey')
        .then(() => {
          expect(log.info).to.have.been.calledWith(sinon.match(/fallback.*deprecated/));
        });
    });
    
    it('should fallback to provided value and write error to log upon communication failure with petri', () => {
      rpcServer.reset();
      const {client, log} = setup();
      
      return client()
        .conductExperiment('aKey', 'fallbackValue')
        .then(res => {
          expect(res).to.equal('fallbackValue');
          expect(log.error).to.have.been.calledWith(sinon.match(/Failed.*petri.*fallback/));
        });
    });

    it('should throw if no fallback provided', () => {
      rpcServer.reset();
      const {client} = setup();
      return expect(client().conductExperiment('aKey')).to.be.rejected;
    });
  });

  describe('conductAllInScope', () => {

    it('should pass-on scope to laboratory server and return a response', () => {
      rpcServer.onConductAllInScope((params, respond) => {
        expect(params).to.deep.equal(['aScope']);
        respond({result: {'key1': 'value1', 'key2': 'value2'}});
      });
      const {client} = setup();

      return client()
        .conductAllInScope('aScope')
        .then(res => expect(res).to.deep.equal({'key1': 'value1', 'key2': 'value2'}));
    });
    
    it('should handle communication failure with petri by returning empty list of experiments and writing error to log', () => {
      rpcServer.reset();
      const {client, log} = setup();
      
      return client()
        .conductAllInScope('aScope')
        .then(res => {
          expect(res).to.deep.equal({});
          expect(log.error).to.have.been.calledWith(sinon.match(/Failed.*petri.*empty/));
        });
    });
  });

  function setup() {
    const log = sinon.createStubInstance(Logger);
    const client = () => petriClient.factory(rpcClient.factory(), `http://localhost:${rpcServer.getPort()}`, log).client({});
    return {client, log}
  }

  function RpcServer() {
    const rpcServer = rpcTestkit.server();
    const defaultResponse = {error: {code: 121212, message: 'not handled'}};
    let conductExperimentHandler = () => defaultResponse;
    let conductAllInScopeHandler = () => defaultResponse;

    this.onConductExperiment = handler => conductExperimentHandler = handler;
    this.onConductAllInScope = handler => conductAllInScopeHandler = handler;
    this.reset = () => {
      conductExperimentHandler = () => defaultResponse;
      conductAllInScopeHandler = () => defaultResponse;
    };
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
