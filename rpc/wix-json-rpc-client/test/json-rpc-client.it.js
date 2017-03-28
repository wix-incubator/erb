const expect = require('chai').use(require('sinon-chai')).expect,
  testkit = require('wix-http-testkit'),
  jsonrpc = require('node-express-json-rpc2'),
  sinon = require('sinon'),
  rpcClient = require('..'),
  _ = require('lodash');

describe('json rpc client it', () => {
  const server = aServer();

  server.beforeAndAfter();

  it('should send and get response from rpc client', () =>
    expect(clientFactory(serviceUrl('SomePath')).invoke('add', 2, 2)).to.eventually.equal(4)
  );

  it('should send rpc client and check that header hook is triggered', () => {
    let hookSentFlag = false;

    return expect(clientFactory(() => hookSentFlag = true, serviceUrl('SomePath')).invoke('add', 2, 2)).to.eventually.equal(4)
      .then(() => expect(hookSentFlag).to.be.true);
  });

  it('should send and get response from rpc client for function with no parameters', () =>
    expect(clientFactory(serviceUrl('SomePath')).invoke('foo')).to.eventually.equal('bar')
  );

  it('should be rejected because invokes non existing function', () =>
    expect(clientFactory(serviceUrl('SomePath')).invoke('notExistsFunction'))
      .to.be.rejectedWith(rpcClient.errors.RpcError, 'Method not found')
  );

  it('should be rejected upon a post to non-existent endpoint', () =>
    expect(clientFactory(serviceUrl('SomeNonExistPath')).invoke('hi'))
      .to.be.rejectedWith(rpcClient.errors.RpcClientError, /Cannot POST \/SomeNonExistPath/)
  );

  it('should be rejected when posting to endpoint which does not return json', () =>
    expect(clientFactory(serviceUrl('NonJson')).invoke('hi'))
      .to.be.rejectedWith(rpcClient.errors.RpcClientError, 'expected json response, instead got \'hi\'')
  );

  it('should post to valid endpoint given baseUrl and method are provided as arguments', () =>
    expect(clientFactory(server.getUrl(), 'SomePath').invoke('foo')).to.eventually.equal('bar')
  );

  it('should be rejected given provided timeout is exceeded', () =>
    expect(clientFactory(serviceUrl('TimeoutPath')).invoke('timeout'))
      .to.be.rejectedWith(rpcClient.errors.RpcRequestError, 'network timeout')
  );

  it('should allow options object with timeout override on invoke', () =>
    expect(clientFactory(serviceUrl('TimeoutPath')).invoke({ method: 'timeout', timeout: 60, args: [] }))
      .to.eventually.equal('ok')
  );

  it('should allow options object with args on invoke', () =>
    expect(clientFactory(serviceUrl('SomePath')).invoke({ method: 'add', args: [1,1] }))
      .to.eventually.equal(2)
  );

  it('should be rejected if server is down/not listening', () => {
    const nonListeninPort = server.getPort() + 1;
    return expect(clientFactory(`http://localhost:${nonListeninPort}/SomePath`).invoke('add', 2, 2))
      .to.be.rejectedWith(rpcClient.errors.RpcRequestError, 'connect ECONNREFUSED');
  });

  it('should pass-on context to hook functions', () => {
    const passedObjects = [];
    const factory = rpcClient.factory({ timeout: 1000 });
    factory.registerBeforeRequestHook((headers, body, arg) => passedObjects.push(arg));
    factory.registerAfterResponseHooks((head, arg) => passedObjects.push(arg));

    return factory.clientFactory(serviceUrl('SomePath')).client({ key: 'value' }).invoke('foo').then(() => {
      expect(passedObjects).to.deep.equal([{ key: 'value' }, { key: 'value' }]);
    });
  });
  
  describe('events emitting', () => {
    
    describe('JsonRpcClientFactory', () => {
      
      it('emits "client" event upon client instantiation', () => {
        const {listener, factory} = setup();
        factory.once('client', listener);
        const client = factory.clientFactory('http://some/url').client({});
        expect(listener).to.have.been.calledWith('http://some/url', client);
      });
    });
    
    describe('JsonRpcClient', () => {
      
      it('emits "before" event before hooks have been called', () => {
        const {hook, listener, factory} = setup();
        factory.registerBeforeRequestHook(hook);
        const client = factory.clientFactory(serviceUrl('SomePath')).client();
        client.once('before', listener);
        return client.invoke('foo')
          .then(() => {
            expect(listener).to.have.been.calledWith(sinon.match.any, 'foo');
            expect(listener).to.have.been.calledBefore(hook);
          });
      });

      it('emits "success" event after hooks have been called', () => {
        const {hook, listener, factory} = setup();
        factory.registerAfterResponseHooks(hook);
        const client = factory.clientFactory(serviceUrl('SomePath')).client();
        client.once('success', listener);
        return client.invoke('foo')
          .then(() => {
            expect(listener).to.have.been.calledWith(sinon.match.any).and.calledAfter(hook);
          });
      });

      it('emits "failure" event after hooks have been called', () => {
        const {hook, listener, factory} = setup();
        factory.registerAfterResponseHooks(hook);
        const client = factory.clientFactory(serviceUrl('SomeNonExistPath')).client();
        client.once('failure', listener);
        return client.invoke('foo')
          .catch(() => {
            expect(listener).to.have.been.calledWith(sinon.match.any, sinon.match.instanceOf(rpcClient.errors.RpcClientError)).and.calledAfter(hook);
          });
      });
      
      it('emits "failure" event for server errors', () => {
        const {listener, factory} = setup();
        const client = factory.clientFactory(serviceUrl('SomePath')).client();
        client.on('failure', listener);
        return client.invoke('nonExistentMethod')
          .catch(() => {
            expect(listener).to.have.been.calledWith(sinon.match.any, sinon.match.instanceOf(rpcClient.errors.RpcError)).and.calledOnce;
          });
      });
      
      it('passes context from "before" to "success" listener', () => {
        const {factory} = setup();
        let context;
        const client = factory.clientFactory(serviceUrl('SomePath')).client();
        client.once('before', ctx => {
          ctx['that is'] = 'mine';
        });
        client.once('success', ctx => context = ctx);
        return client.invoke('foo')
          .then(() => {
            expect(context).to.have.property('that is', 'mine');
          });
      });

      it('passes context from "before" to "failure" listener', () => {
        const {factory} = setup();
        let context;
        const client = factory.clientFactory(serviceUrl('SomeNonExistPath')).client();
        client.once('before', ctx => {
          ctx['that is'] = 'mine';
        });
        client.once('failure', ctx => context = ctx);
        return client.invoke('foo')
          .catch(() => {
            expect(context).to.have.property('that is', 'mine');
          });
      });
    });

    function setup() {
      const listener = sinon.spy(function listener() { });
      const hook = sinon.spy(function hook() { });
      const factory = rpcClient.factory({ timeout: 1000 });
      return {hook, listener, factory};
    }
  });
  
  function serviceUrl(service) {
    return `${server.getUrl()}/${service}`;
  }

  function aServer() {
    const server = testkit.server();
    const app = server.getApp();

    app.post('/NonJson', (req, res) => res.send('hi'));

    app.use('/SomePath', jsonrpc());
    app.post('/SomePath', (req, res) => {
      res.rpc('add', (params, respond) => respond({ result: params[0] + params[1] }));
      res.rpc('foo', (params, respond) => respond({ result: 'bar' }));
    });

    app.post('/TimeoutPath', (req, res) => setTimeout(() => res.json({ result: 'ok' }), 50));

    return server;
  }

  function clientFactory(hook) {
    let args = Array.prototype.slice.call(arguments);
    const factory = rpcClient.factory({ timeout: 30 });

    if (args && args.length > 0 && _.isFunction(args[0])) {
      factory.registerBeforeRequestHook(hook);
      factory.registerAfterResponseHooks(hook);
      args = _.drop(args);
    }

    return factory.clientFactory.apply(factory, args).client();
  }
});

