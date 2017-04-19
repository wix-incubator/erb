const {expect} = require('chai').use(require('chai-as-promised')),
  jvmTestkit = require('wix-jvm-bootstrap-testkit'),
  wixRpcClientSupport = require('..'),
  rpcClient = require('wix-json-rpc-client'),
  uuidSupport = require('uuid-support');

describe('wix rpc client support jvm interop', function () {
  this.timeout(600000);
  let userId;
  let rpcServer = anRpcServer().beforeAndAfter();

  beforeEach(() => userId = uuidSupport.generate());

  describe('wix rpc server/client', () => {

    it('should invoke rpc service endpoint providing full service url to client', () => {
      return aRpcFactory()
        .clientFactory(rpcServer.getUrl() + '/Contract')
        .client({})
        .invoke('hello', userId);
    });

    it('should invoke rpc service endpoint providing server url and service name separately', () => {
      return aRpcFactory()
        .clientFactory(rpcServer.getUrl(), 'Contract')
        .client({})
        .invoke('hello', userId);
    });

    it('should throw and error on rpc signing key mismatch', () => {
      const response = aRpcFactory({rpcSigningKey: '9999999999'})
        .clientFactory(rpcServer.getUrl(), 'Contract')
        .client({})
        .invoke('hello', userId)

      return expect(response).to.eventually.be.rejectedWith('Status: 400, Response:');
    });
  });

  describe('wix rpc server interop', () => {

    it('should call rpc operation with single parameter and handle returned response', () => {
      return invoke('hello', userId).then(res =>
        expect(res).to.deep.equal({
          id: userId,
          name: 'John',
          email: 'doe@wix.com'
        }));
    });

    it('should call rpc operation with multiple parameters and handle returned response', () => {
      return invoke('multipleParams', userId, 'aName', 'anEmail@example.org').then(res =>
        expect(res).to.deep.equal({
          id: userId,
          name: 'aName',
          email: 'anEmail@example.org'
        }));
    });

    it('fails when calling rpc function with optional parameter declared and not providing any', () => {
      return Promise.all([
        expect(invoke('optionalParameter', null)).to.eventually.be.fulfilled,
        expect(invoke('optionalParameter')).to.eventually.be.rejectedWith('Method [optionalParameter] was not found')
      ]);
    });

    it('should return response for an rpc operation that has return type of scala Option and returns response', () => {
      return invoke('responseTypeOptionReturnsSome', userId).then(res =>
        expect(res).to.deep.equal({
          id: userId,
          name: 'John',
          email: 'doe@wix.com'
        }));
    });

    it('should return success with null response for an rpc operation that has return type of scala Option and returns None', () => {
      return invoke('responseTypeOptionReturnsNone', userId)
        .then(res => expect(res).to.be.null);
    });

    it('should return success with null response for an rpc operation with void return type', () => {
      return invoke('responseTypeVoid', userId)
        .then(res => expect(res).to.be.null);
    });

    it('should return response for an rpc operation with no parameters', () => {
      return invoke('noParameters').then(res =>
        expect(res).to.deep.equal({
          id: null,
          name: 'John',
          email: 'doe@wix.com'
        }));
    });

    it('should return success with null response for an rpc operation with declared response that returns a null', () => {
      return invoke('noParametersReturnsNull')
        .then(res => expect(res).to.be.null);
    });

    it('should return failure with exception details given rpc operation throws and error', () => {
      return expect(invoke('fail', userId)).to.eventually.be.rejectedWith(userId);
    });
  });

  function anRpcServer() {
    return jvmTestkit.server({
      artifact: {
        groupId: 'com.wixpress.node',
        artifactId: 'wix-spjs-test-server',
        version: '1.0.0-SNAPSHOT'
      }
    });
  }

  function aRpcFactory(opts) {
    const rpcFactory = rpcClient.factory();
    wixRpcClientSupport.get(opts || {rpcSigningKey: wixRpcClientSupport.devSigningKey}).addTo(rpcFactory);
    return rpcFactory;
  }

  function invoke() {
    const client = aRpcFactory().clientFactory(rpcServer.getUrl(), 'Contract').client({});
    return client.invoke.apply(client, arguments);
  }
});
