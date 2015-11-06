# wix-logging-client-support

Injects metadata from request to logging events. 

## install

```js
npm install --save wix-logging-client-support
```

## usage

In a wiring/bootstrap layer you should do:

```js
const loggingClient = require('wix-logging-client');

require('wix-logging-client-support').addTo(loggingClient);
 
//create logger, prepare via adapter...
```

## Api

### addTo(loggingClient)
Add a metadata injecting hook to a logging client.