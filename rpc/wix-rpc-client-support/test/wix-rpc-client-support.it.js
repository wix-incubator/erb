'use strict';
const expect = require('chai').expect,
  jvmTestkit = require('wix-jvm-bootstrap-testkit'),
  httpTestkit = require('wix-http-testkit'),
  wixExpressDomain = require('wix-express-domain'),
  wixRpcClientSupport = require('..'),
  rpcClient = require('json-rpc-client'),
  uuidSupport = require('uuid-support'),
  request = require('request');

//TODO: use more sophisticated request with petri, reqContext, etc. - it should be added to wix-http-testkit
describe('wix rpc client', function () {
  this.timeout(240000);
  let rpcServer = anRpcServer();
  let httpServer = aServer(rpcServer);

  rpcServer.beforeAndAfter();
  httpServer.beforeAndAfter();

  it('should invoke rpc service endpoint', done => {
    request(httpServer.getUrl('hello'), (error, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(JSON.parse(body)).to.deep.equal({
        name: 'John',
        email: 'doe@wix.com'
      });
      done();
    });
  });

  function anRpcServer() {
    let server = jvmTestkit.server({
      artifact: {
        groupId: 'com.wixpress.node',
        artifactId: 'wix-rpc-server',
        version: '1.0.0-SNAPSHOT'
      }
    });

    return server;
  }

  function aServer(rpcServer) {
    let server = httpTestkit.httpServer();
    let app = server.getApp();

    app.use(wixExpressDomain);

    const rpcFactory = rpcClient.factory();
    wixRpcClientSupport.get({rpcSigningKey: '1234567890'}).addTo(rpcFactory);
    const client = rpcFactory.client(rpcServer.getUrl('RpcServer'), 1000);

    //TODO: add fail as well
    app.get('/hello', (req, res) => {
      client.invoke('hello', uuidSupport.generate()).then(
          resp => res.send(resp),
          err => res.status(500).send({message: err.message, name: err.name, stack: err.stack})
      );
    });

    return server;
  }
});