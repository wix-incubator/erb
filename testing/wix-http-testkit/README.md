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
  app.get('/', (req, res) => res.send('hello'));
  
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
Returns an instance of `WixHttpTestkit`. Given options are not provided, port can be retrieved via `getPort()`, otherwise you can override default port by providing options:

```js
{
  port: 2222
}
```

### WixHttpTestkit 
A server you can configure and start/stop multiple times.

Extends [WixTestkitBase](../wix-testkit-base) which provide start/stop/beforeAndAfter and other capabilities.

#### getApp()
Returns a `express` app which you can configure to your liking.

#### getPort()
Returns an port on which server will listen.

#### getUrl(path)
Returns a url on which server will listen, ex. 'http://localhost:3333'

Parameters:
 - path - optional, given path parameter, it will append it to base url, ex. `getUrl('ok')` -> `http://localhost:3000/ok`