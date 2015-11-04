# wix-http-testkit

Provides [express](http://expressjs.com/) embedded server for usage in tests.

## install

```js
npm install --save-dev wix-http-testkit
```

## usage

### HttpServer

```js
const httpTestkit = require('wix-http-testkit'),
  request = require('request'),
  expect = require('chai').expect;

describe('some', () => {
  const server = httpTestkit.httpServer();
  const app = server.getApp();
  app.get('/', function (req, res) {
    res.send('hello');
  });
  
  it('should show usage', done => {
    server.listen(() => {
      request.get(server.getUrl(), (error, response) => {
        expect(response.statusCode).to.equal(200);
        server.close(done);
      });
    });
  });
});
```

Or simplified version:

```js
const httpTestkit = require('wix-http-testkit'),
  request = require('request'),
  expect = require('chai').expect;

describe('some', () => {
  const server = httpTestkit.httpServer();
  const app = server.getApp();
  app.get('/', function (req, res) {
    res.send('hello');
  });
  
  server.beforeAndAfterEach();
  
  it('should show usage', done => {
    request.get(server.getUrl(), (error, response) => {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });
});
```

## Api

### httpServer(options)
Returns an instance of `HttpServer`. Given options are not provided, port can be retrieved via `getPort()`, otherwise you can override default port by providing options:

```js
{
  port: 2222
}
```

### HttpServer
A server you can configure and start/stop multiple times.

#### listen(callback)
Starts a server; Accepts optional callback;

#### close(callback)
Stop a server; Accepts optional callback;

#### getApp()
Returns a `express` app which you can configure to your liking.

#### getPort()
Returns an port on which server will listen.

#### getUrl()
Returns a url on which server will listen, ex. 'http://localhost:3333'

#### beforeAndAfter()
So that instead of:

```js
const httpTestkit = require('wix-http-testkit');

describe('some', () => {
  const server = httpTestkit.httpServer();
  //configure server

  before(done => server.listen(done));
  after(done => server.close(done));
});
```

you could do:

```js
const httpTestkit = require('wix-http-testkit');

describe('some', () => {
  const server = httpTestkit.httpServer();
  //configure server
  
  server.beforeAndAfter();
});
```

#### beforeAndAfterEach()
So that instead of:

```js
const httpTestkit = require('wix-http-testkit');

describe('some', () => {
  const server = httpTestkit.httpServer();
  //configure server

  beforeEach(done => server.listen(done));
  afterEach(done => server.close(done));
});
```

you could do:

```js
const httpTestkit = require('wix-http-testkit');

describe('some', () => {
  const server = httpTestkit.httpServer();
  //configure server
  
  server.beforeAndAfterEach();
});
```