# wix-http-testkit

Provides [express](http://expressjs.com/) embedded server for usage in tests.

## install

```js
npm install --save-dev wix-http-testkit
```

## usage

```js
const testkit = require('wix-http-testkit'),
  request = require('request'),
  expect = require('chai').expect;

describe('some', () => {
  const server = testkit.server();
  const app = server.getApp();
  app.get('/', function (req, res) {
    res.send('hello');
  });
  
  before(() => server.start());
  after(() => server.stop());
  
  it('should show usage', done => {
    request.get(server.getUrl(), (error, response) => {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });
});
```

## Api

### server(options)
Returns an instance of `HttpServer`. Given options are not provided, port can be retrieved via `getPort()`, otherwise you can override default port by providing options:

```js
{
  port: 2222
}
```

### HttpServer
A server you can configure and start/stop multiple times.

#### start(callback)
Starts a server; Accepts optional callback and returns a `Promise`;

#### stop(callback)
Stops a server; Accepts optional callback and returns a `Promise`;

#### getApp()
Returns a `express` app which you can configure to your liking.

#### getPort()
Returns an port on which server will listen.

#### getUrl(path)
Returns a url on which server will listen, ex. 'http://localhost:3333'

Parameters:
 - path - optional, given path parameter, it will append it to base url, ex. `getUrl('ok')` -> `http://localhost:3000/ok`

#### beforeAndAfter()
Starts/stops server around your tests, so that instead of:

```js
const testkit = require('wix-http-testkit');

describe('some', () => {
  const server = testkit.server();
  //configure server

  before(() => server.listen());
  after(() => server.close());
});
```

you could do:

```js
const testkit = require('wix-http-testkit');

describe('some', () => {
  const server = testkit.server();
  //configure server
  
  server.beforeAndAfter();
});
```

#### beforeAndAfterEach()
Same as `beforeAndAfter` but starts server around each test.