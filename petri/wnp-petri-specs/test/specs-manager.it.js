const specs = require('./specs-fixture').all,
  SpecsManager = require('../lib/specs-manager'),
  Logger = require('wnp-debug').Logger,
  sinon = require('sinon'),
  expect = require('chai').use(require('sinon-chai')).use(require('chai-as-promised')).expect,
  rpcTestkit = require('wix-rpc-testkit'),
  rpcClient = require('wix-json-rpc-client');


describe('PetriSpecsManager', () => {

  const syncSpecsProxy = rpcTestkit.server().beforeAndAfter();

  const rpcFactory = rpcClient.factory();
  
  describe('send', () => {
    
    it('should send added specs and log', () => {
      let receivedSpecs = [];
      syncSpecsProxy.when('petriContext', 'addSpecs').respond((params) => receivedSpecs = params[0]);
      const {manager, log} = setup();
      manager.addSpecs(specs);
      return manager.send()
        .then(() => {
          expect(receivedSpecs).to.have.deep.property('[0].key', 'spec1');
          expect(receivedSpecs).to.have.deep.property('[1].key', 'spec2');
          expect(log.info).to.have.been.calledWithMatch(/spec1.*spec2/);
        });
    });
    
    it('should not send if no specs added', () => {
      let called = false;
      const {manager, log} = setup();
      syncSpecsProxy.when('petriContext', 'addSpecs').respond(() => called = true);
      return manager.send().then(() => {
        expect(called).to.be.false;
        expect(log.info).to.have.been.calledWithMatch(/No.*specs.*detected/);
      });
    });

    it('should log failure', () => {
      syncSpecsProxy.when('petriContext', 'addSpecs').throw(new Error('not this time!'));
      const {manager, log} = setup();
      manager.addSpecs(specs);
      return expect(manager.send()).to.be.rejected
        .then(() => {
          expect(log.error).to.have.been.calledWithMatch(/Failed.*petri.*specs/);
        });
    });
  });
  
  function setup() {
    const log = sinon.createStubInstance(Logger);
    const manager = new SpecsManager(rpcFactory, syncSpecsProxy.getUrl('/'), log);
    return {manager, log}
  }
});
