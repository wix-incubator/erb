# wix-rpc-testkit

Embedded server to expose fake/mock rpc services. It is not inteded to be contract-compliant with wix rpc server implementation (signature verification, etc.), but instead a simple wrapper on top of [node-express-json-rpc2](https://www.npmjs.com/package/node-express-json-rpc2) with defaults infered from existing wix rpc services like rpc server mappings.

## install

```bash
npm install --save-dev wix-rpc-testkit
```

## usage

Say you want to have a fake for service 'meta-site-manager', interface 'ReadOnlyMetaSiteManager' and method 'getMetaSite' [app-info](http://app10.aus.wixpress.com:25684/meta-site-manager/rpc/services) in your tests.

```js
const testkit = require('wix-rpc-testkit'),
  chai = require('chai'),
  expect = chai.expect,
  jsonClient = require('wix-json-rpc-client');

chai.use(require('chai-as-promised'));

describe('describe', () => {
  const app = testkit.server();
  app.beforeAndAfter();

  it('test success', () =>
    app.when('ReadOnlyMetaSiteManager', 'getMetaSite').respond(123);
    expect(jsonClient.factory().clientFactory(app.getUrl('ReadOnlyMetaSiteManager')).client({}).invoke('getMetaSite'))
      .to.eventually.equal(123);
  );

  it('test failure', () =>
    app.when('ReadOnlyMetaSiteManager', 'getMetaSite').throws(new Error('nope'));
    expect(jsonClient.factory().clientFactory(app.getUrl('ReadOnlyMetaSiteManager')).client({}).invoke('getMetaSite'))
      .to.be.rejectedWith('nope');
  );
});
```

What just happened here?:)
 - you created a new instance of `WixRpcServer` that will be started on random port;
 - you added resonse definition for service 'ReadOnlyMetaSiteManager' and method 'getMetaSite';
 - you used `WixRpcServer.beforeAndAfter()` to start server before all tests and stop after all;
 - you used `WixRpcServer.getUrl(serviceName)` to get url for rpc service.

## Api
### server(opts)
Returns an instance of `WixRpcServer`. Given options are not provided, port can be retrieved via `getPort()`, otherwise you can override default port by providing options:

```js
{
  port: 2222
}
```

### WixRpcServer
A server you can configure and start/stop multiple times.

#### start(callback)
Starts a server; Accepts optional callback and returns a `Promise`;

#### stop(callback)
Stop a server; Accepts optional callback and returns a `Promise`;

#### getPort()
Returns an port on which server will listen.

#### getUrl(serviceName)
Returns a url on which server will listen, ex. 'http://localhost:3333'

Parameters:
 - serviceName - optional, given path parameter, it will append it to base url, ex. `getUrl('ok')` -> `http://localhost:3000/_rpc/ok`

#### when(serviceName, methodName)
Adds rpc service and methods.

Parameters:
 - serviceName - name of rpc service (or trait in scala terms);
 - methodName - name of the method you want to respond to.

 Returns an object with two methods, one of which you should use to define the response:
 - respond - you can either pass the result to it, or a callback like: `rpcServer.when(service, method).respond(params => params[0]);`
 - throws - use it in case you want to respond with error, you can pass a callback like above or simply do something like `rpcServer.when(service, method).throws(new Error(123));`

 ### reset()
Remove all response definitions. Note that this happens automatically when rpc server is stopped, so no need to call it explicitly in those cases.

#### beforeAndAfter()
Starts server around all tests within `describe` scope.

```js
const testkit = require('wix-rpc-testkit');

describe('some', () => {
  const server = testkit.server();
  //configure server

  before(() => server.listen());
  after(() => server.close());

  //run tests
});
```

you could do:

```js
const testkit = require('wix-rpc-testkit');

describe('some', () => {
  const server = testkit.server();
  //configure server

  server.beforeAndAfer();

  //run tests
});
```

#### beforeAndAfterEach()
Same as `beforeAndAfter()`, just runs around each test.
