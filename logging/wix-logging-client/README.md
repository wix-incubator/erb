# wix-logging-client-support

Injects metadata from request to logging events. 

# installation

```js
npm i --save wix-logging-client-support
```

# usage

In a wiring/bootstrap layer you should do:

```js
const loggingClient = require('wix-logging-client');

require('wix-logging-client-support').addTo(loggingClient);
 
//create logger, prepare via adapter...
```

# api

## addTo(loggingClient)

Add a metadata injecting hook to a logging client.