'use strict';
const chai = require('chai'),
  expect = chai.expect,
  testkit = require('wix-http-testkit'),
  jsonrpc = require('node-express-json-rpc2'),
  rpcClient = require('..'),
  _ = require('lodash');

chai.use(require('chai-as-promised'));

describe('json rpc client', () => {
  const server = aServer();

  server.beforeAndAfter();

  it('should send and get response from rpc client', () =>
    expect(client(serviceUrl('SomePath')).invoke('add', 2, 2)).to.eventually.equal(4)
  );

  it('should send rpc client and check that header hook is triggered', () => {
    let hookSentFlag = false;

    return expect(client(() => hookSentFlag = true, serviceUrl('SomePath')).invoke('add', 2, 2)).to.eventually.equal(4)
      .then(() => expect(hookSentFlag).to.be.true);
  });

  it('should send and get response from rpc client for function with no parameters', () =>
    expect(client(serviceUrl('SomePath')).invoke('foo')).to.eventually.equal('bar')
  );

  it('should be rejected because invokes non existing function', () =>
    expect(client(serviceUrl('SomePath')).invoke('notExistsFunction')).to.be.rejectedWith('Method not found')
  );

  it('should be rejected upon a post to non-existent endpoint', () =>
    expect(client(serviceUrl('SomeNonExistPath')).invoke('hi')).to.be.rejectedWith('Error: Status: 404, Response: \'Cannot POST /SomeNonExistPath\n\'')
  );

  it('should be rejected when posting to endpoint which does not return json', () =>
    expect(client(serviceUrl('NonJson')).invoke('hi')).to.be.rejectedWith('expected json response, instead got \'hi\'')
  );

  it('should post to valid endpoint given baseUrl and method are provided as arguments', () =>
    expect(client(server.getUrl(), 'SomePath').invoke('foo')).to.eventually.equal('bar')
  );

  it('should be rejected given provided timeout is exceeded', () =>
    expect(client(serviceUrl('TimeoutPath')).invoke('timeout')).to.be.rejectedWith('network timeout')
  );

  it('should be rejected if server is down/not listening', () => {
    const nonListeninPort = server.getPort() + 1;
    return expect(client(`http://localhost:${nonListeninPort}/SomePath`).invoke('add', 2, 2)).to.be.rejectedWith('connect ECONNREFUSED');
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
      res.rpc('add', (params, respond) => respond({result: params[0] + params[1]}));
      res.rpc('foo', (params, respond) => respond({result: 'bar'}));
    });

    app.post('/TimeoutPath', (req, res) => setTimeout(() => res.end(), 1500));

    return server;
  }

  function client(hook) {
    let args = Array.prototype.slice.call(arguments);
    const factory = rpcClient.factory({timeout: 1000});

    if (args && args.length > 0 && _.isFunction(args[0])) {
      factory.registerHeaderBuildingHook(hook);
      args = _.drop(args);
    }

    return factory.client.apply(factory, args);
  }
});

