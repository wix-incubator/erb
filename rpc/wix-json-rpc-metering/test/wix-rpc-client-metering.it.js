const expect = require('chai').use(require('chai-things')).use(require('sinon-chai')).expect,
  rpcClientMetering = require('..'),
  statsdTestkit = require('wix-statsd-testkit'),
  eventually = require('wix-eventually'),
  rpcTestkit = require('wix-rpc-testkit'),
  WixMeasuredFactory = require('wix-measured'),
  WixStatsdAdapter = require('wix-measured-statsd-adapter'),
  StatsD = require('node-statsd'),
  rpc = require('wix-json-rpc-client').factory,
  Promise = require('bluebird'),
  {ErrorCode} = require('wix-errors'),
  sleep = require('sleep'),
  sinon = require('sinon'),
  Logger = require('wnp-debug').Logger;

describe('RPC client metering', function() {
  const statsd = statsdTestkit.server().beforeAndAfter();
  const server = rpcTestkit.server().beforeAndAfter();
  beforeEach(() => statsd.clear());
  
  server.when('SomeService', 'foo').respond(() => {
    sleep.msleep(50);
    return 'ok';
  });
  
  it('reports RPC call meter', () => {
    const client = newRpcClient().clientFactory.client({});
    return Promise.all([client.invoke('foo'), client.invoke('foo')])
      .then(() => eventually(() => {
        expect(valuesOf(statsd, 'tag=RPC_CLIENT.service=SomeService.method=foo.samples')).to.include.one.above(1);
      }));
  });
  
  it('reports RPC call response time histogram', () => {
    return newRpcClient().clientFactory.client({}).invoke('foo')
      .then(() => eventually(() => {
        expect(valuesOf(statsd, 'tag=RPC_CLIENT.service=SomeService.method=foo.p999')).to.include.one.closeTo(50, 25);
      }));
  });
  
  it('reports errors meter', () => {
    const client = newRpcClient().clientFactory.client({});
    return client.invoke('unknown')
      .catch(() => eventually(() => {
        expect(valuesOf(statsd, `tag=RPC_CLIENT.service=SomeService.method=unknown.error=RpcError.code=${ErrorCode.RPC_ERROR}.samples`)).not.to.be.empty;
      }));
  });
  
  it('invocations are isolated', () => {
    const rpcClient = newRpcClient().clientFactory.client({});
    return Promise.all([rpcClient.invoke('foo'), rpcClient.invoke('unknown')])
      .catch(() => eventually(() => {
        expect(statsd.events('tag=RPC_CLIENT.service=SomeService.method=unknown.error=RpcError')).not.to.be.empty;
        expect(statsd.events('tag=RPC_CLIENT.service=SomeService.method=foo.samples')).not.to.be.empty;
      }));
  });
  
  it('does not fail RPC request upon "success" event handler failure', () => {
    const {clientFactory, log, wixMeasuredFactory} = newRpcClient(withMockedWixMeasuredFactory()); 
    const rpcClient = clientFactory.client({});
    const error = new Error('kaboom!');
    wixMeasuredFactory.collection.throws(error);

    return rpcClient.invoke('foo')
      .then(() => {
        expect(log.error).to.have.been.calledWithMatch(/Failed.*metrics/, error);
      });
  });

  it('does not fail RPC request upon "failure" event handler failure', () => {
    const {clientFactory, log, wixMeasuredFactory} = newRpcClient(withMockedWixMeasuredFactory());
    const rpcClient = clientFactory.client({});
    const error = new Error('kaboom!');
    wixMeasuredFactory.collection.throws(error);

    return rpcClient.invoke('undefined')
      .catch(() => {
        expect(log.error).to.have.been.calledWithMatch(/Failed.*metrics/, error);
      });
  });
  
  function withMockedWixMeasuredFactory() {
    return sinon.createStubInstance(WixMeasuredFactory);
  }
  
  function newRpcClient(wixMeasuredFactory = withRealWixMeasuredFactory()) {
    const rpcClientFactory = rpc();
    const log = sinon.createStubInstance(Logger);
    rpcClientMetering(wixMeasuredFactory, log).addTo(rpcClientFactory);
    return {wixMeasuredFactory, clientFactory: rpcClientFactory.clientFactory(server.getUrl('SomeService')), log};
  }
  
  function withRealWixMeasuredFactory() {
    const statsdAdapter = new WixStatsdAdapter(new StatsD({host: 'localhost'}), {interval: 10});
    const wixMeasuredFactory = new WixMeasuredFactory('localhost', 'my-app').addReporter(statsdAdapter);
    afterEach(() => statsdAdapter.stop());
    return wixMeasuredFactory;
  }
  
  const valuesOf = (statsd, filter) => statsd.events(filter).map(e => e.value);
});
