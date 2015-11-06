'use strict';
const chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  expect = chai.expect,
  rpcDriver = require('./support/rpc-driver'),
  httpTestkit = require('wix-http-testkit'),
  jsonrpc = require('node-express-JSON-RPC2');

chai.use(chaiAsPromised);

describe('json rpc client', () => {
  const server = aServer();
  const driver = rpcDriver.forServer(server);

  server.beforeAndAfter();

  it('should send and get response from rpc client', () => {
    return expect(driver.rpcClientFor('/SomePath').invoke('add', 2, 2)).to.eventually.equal(4);
  });

  it('should send rpc client and check that header hook is triggered', () => {
    let hookSentFlag = false;
    const factoryWithHook = driver.rpcFactoryWithHook(() => hookSentFlag = true);

    return expect(factoryWithHook.rpcClientFor('/SomePath').invoke('add', 2, 2)).to.eventually.equal(4)
      .then(() => expect(hookSentFlag).to.be.true);
  });

  it('send and get response from rpc client for function with no parameters', () => {
    return expect(driver.rpcClientFor('/SomePath').invoke('foo')).to.eventually.equal('bar');
  });

  it('should be rejected because invoke not exists function', () => {
    return expect(driver.rpcClientFor('/SomePath').invoke('notExistsFunction')).to.be.rejectedWith('Method not found');
  });

  it('post to 404 endpoint, should be rejected', () => {
    return expect(driver.rpcClientFor('/SomeNonExistPath').invoke('hi')).to.be.rejected;
  });

  it('post to endpoint which does not return json', () => {
    return expect(driver.rpcClientFor('/NonJson').invoke('hi')).to.be.rejected;
  });

  describe('on server down', () => {
    before(done => server.close(done));
    after(done => server.listen(done));

    it('should be rejected', () => {
      return expect(driver.rpcClientFor('/SomePath').invoke('add', 2, 2)).to.be.rejectedWith('connect ECONNREFUSED');
    });
  });

  function aServer() {
    const server = httpTestkit.httpServer();
    const app = server.getApp();

    app.use('/SomePath', jsonrpc());

    app.post('/NonJson', (req, res) => res.send('hi'));
    app.post('/SomePath', (req, res) => {
      res.rpc('add', (params, respond) => respond({result: params[0] + params[1]}));
      res.rpc('foo', (params, respond) => respond({result: 'bar'}));
    });

    return server;
  }

});

