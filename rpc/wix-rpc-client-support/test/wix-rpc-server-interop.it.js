'use strict';
const chai = require('chai'),
  expect = chai.expect,
  jvmTestkit = require('wix-jvm-bootstrap-testkit'),
  wixRpcClientSupport = require('..'),
  rpcClient = require('json-rpc-client'),
  uuidSupport = require('uuid-support');

chai.should();
chai.use(require('chai-as-promised'));

describe('wix rpc client support jvm interop', function () {
  this.timeout(240000);
  let userId;
  let rpcServer = anRpcServer().beforeAndAfter();

  beforeEach(() => userId = uuidSupport.generate());

  describe('wix rpc server/client', () => {

    it('should invoke rpc service endpoint providing full service url to client', () =>
      aRpcFactory()
        .client(rpcServer.getUrl() + '/Contract')
        .invoke('hello', userId)
    );

    it('should invoke rpc service endpoint providing server url and service name separately', () =>
      aRpcFactory()
        .client(rpcServer.getUrl(), 'Contract')
        .invoke('hello', userId)
    );

    it('should throw and error on rpc signing key mismatch', () =>
      aRpcFactory({rpcSigningKey: '9999999999'})
        .client(rpcServer.getUrl(), 'Contract')
        .invoke('hello', userId).should.eventually.be.rejectedWith('Error 400 Bad Request')
    );
  });

  describe('wix rpc server interop', () => {

    it('should call rpc operation with single parameter and handle returned response', () =>
      invoke('hello', userId).then(res =>
        expect(res).to.deep.equal({
          id: userId,
          name: 'John',
          email: 'doe@wix.com'
        }))
    );

    it('should call rpc operation with multiple parameters and handle returned response', () =>
      invoke('multipleParams', userId, 'aName', 'anEmail@example.org').then(res =>
        expect(res).to.deep.equal({
          id: userId,
          name: 'aName',
          email: 'anEmail@example.org'
        }))
    );

    it('should return response for an rpc operation that has return type of scala Option and returns response', () =>
      invoke('responseTypeOptionReturnsSome', userId).then(res =>
        expect(res).to.deep.equal({
          id: userId,
          name: 'John',
          email: 'doe@wix.com'
        }))
    );

    it('should return success with null response for an rpc operation that has return type of scala Option and returns None', () =>
      invoke('responseTypeOptionReturnsNone', userId).then(res => expect(res).to.be.null)
    );

    it('should return success with null response for an rpc operation with void return type', () =>
      invoke('responseTypeVoid', userId).then(res => expect(res).to.be.null)
    );

    it('should return response for an rpc operation with no parameters', () =>
      invoke('noParameters').then(res =>
        expect(res).to.deep.equal({
          id: null,
          name: 'John',
          email: 'doe@wix.com'
        }))
    );

    it('should return success with null response for an rpc operation with declared response that returns a null', () =>
      invoke('noParametersReturnsNull').then(res => expect(res).to.be.null)
    );

    it('should return failure with exception details given rpc operation throws and error', () =>
      invoke('fail', userId).should.eventually.be.rejectedWith(userId)
    );
  });

  function anRpcServer() {
    return jvmTestkit.server({
      artifact: {
        groupId: 'com.wixpress.node',
        artifactId: 'wix-rpc-server',
        version: '1.0.0-SNAPSHOT'
      }
    });
  }

  function aRpcFactory(opts) {
    const rpcFactory = rpcClient.factory();
    wixRpcClientSupport.get(opts || {rpcSigningKey: '1234567890'}).addTo(rpcFactory);
    return rpcFactory;
  }

  function invoke() {
    const client = aRpcFactory().client(rpcServer.getUrl(), 'Contract');
    return client.invoke.apply(client, arguments);
  }
});
