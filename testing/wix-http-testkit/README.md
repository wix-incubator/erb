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

Note that if you enable `https` support you need to tweak your http client as well, as node does not trust self-signed certificates by default. Regarding actual strategy how to organize your code and how to enabled full trust for dev mode but to disable it for production is up to you, but simple case could be:

```js
const fetch = require('node-fetch'),
  HttpsAgent = require('https').Agent;

const prodMode = process.env.NODE_ENV || process.env.NODE_ENV === 'production';

module.exports = url => {
    return fetch(url, {agent: new HttpsAgent({rejectUnauthorized: prodMode})})
}
```


## Api

### server(options)
Returns an instance of `WixHttpTestkit`. Given options are not provided, port can be retrieved via `getPort()`, otherwise you can override default port by providing options:

Parameters:
 - options - object, optional:
   - port - int, port to listen on;
   - ssl - boolean, should server be started as `https://...` with self-signed certificate;

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
Returns a url on which server will listen, ex. 'http://localhost:3333' or 'https://localhost:3333' if ssl is enabled. 

Parameters:
 - path - optional, given path parameter, it will append it to base url, ex. `getUrl('ok')` -> `http://localhost:3000/ok`