# wix-statsd-testkit

Provides a fake [statsd](https://github.com/etsy/statsd) service to capture statsd events in a way for wix tooling produces and parses them.

## install

```js
npm install --save-dev wix-statsd-testkit
```

## usage

```js
const testkit = require('wix-statsd-testkit'),
  dgram = require('dgram'),
  eventually = require('wix-eventually').with({timeout: 1000}),
  expect = require('chai').expect;

describe('some', () => {
  const server = testkit.server().beforeAndAfter();

  it('should show usage', () => {
    return Promise.resolve()
      .then(() => client(server).send('gauge=aGauge', 12))
      .then(() => eventually(() => expect(server.events().length).to.equal(1)))
  });

  function client(server) {
    const sendMessage = (key, value) => {
      return new Promise((resolve, reject) => {
        var client = dgram.createSocket('udp4');
        const message = `${key}:${value}|g`;
        client.send(message, 0, message.length, server.port, 'localhost', function (err) {
          if (err) {
            reject(err);
          }
          client.close();
          resolve();
        });
      });
    };

    return {
      send: sendMessage
    };
  }
});
```

## Api

### server(options): WixStatsDTestkit
Returns an instance of `WixStatsDTestkit`. Given options are not provided, port can be retrieved via `port`, otherwise you can override default port by providing options:

Parameters:
 - options - object, optional:
   - port - int, port to listen on;

```js
{
  port: 2222
}
```

### WixStatsDTestkit
A server you can configure and start/stop multiple times.

Extends [WixTestkitBase](../wix-testkit-base) which provide start/stop/beforeAndAfter and other capabilities.

#### port: int
Returns an port on which server will listen.

#### events(fragment): [{key, value}]
Returns collected events with optional filter by part of key.

Say you have event: `host=localhost.app-name=myApp.gauge=aGauge:123|g`

This would result in:

```js
{
  key: 'host=localhost.app-name=myApp.gauge=aGauge',
  value: '123'
}
```

#### clear()
Clear collected events.
