# wix-bi-node-testkit

A testkit that tails on bi log files and allows you to get collected bi events (MESSAGE part). It can be scoped to test-suite (beforeAndAfter()) or test (beforeAndAfterEach()). 

Bi log dir resolution:
 - factoryParam `logDir` -> `process.env.APP_LOG_DIR` -> `./target/logs/`;
 - it tails on files matching pattern `wix.bi*.log`.

## install

```bash
npm i -S wix-bi-node-testkit
```

## usage

Given you have an app that logs bi event with key 'evtId' = '1';

```js
const biTestkit = require('wix-bi-node-testkit'),
  expect = require('chai').expect,
  fetch = require('node-fetch');    

describe('bi testkit', () => {
  biInterceptor = biTestkit.interceptor()
    .beforeAndAfter();

  it('should capture logged events', () => 
   return fetch('http://localhost:3000/bi')
      .then(() => expect(biInterceptor.events.pop()).to.have.deep.property('evtId', '1')));
});
```

# Api

## interceptor(logDir): WixBiTestkit
Returns an instance of `WixBiTestkit` (which extends [wix-testkit-base](../testkit/wix-testkit-base)).

Parameters:
 - logDir - directory to watch for bi events to be logged. 
 
### WixBiTestkit.events
Returns an array of logged bi events (MESSAGE part). 
