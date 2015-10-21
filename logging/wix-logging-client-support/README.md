# wix-logging-client

Shared module for logging-adapters. 

# installation

```js
npm i --save wix-logging-client
```

# usage

Responsibility of adapter is pass-on logging events from target loggers (console, debug, winston...) to wix-infrastructure.

Say we have a dummy logger adapter:

```js
const client = require('wix-logging-client');

exports.setup = () => {
    client.write({
        timestamp: new Date().getTime(),
        level: 'info',
        category: 'dummy',
        msg: 'log message'
    });
};
```

object passed over to write function must contain:
 - timestamp: time call, ms;
 - level: level of event, one of debug, info, warn, error;
 - category: well, category. If library being adapted contains categories, then pass it over, otherwise you can hardcode to name of library or such.
 - msg: log message, optional if error object is present;
 - error: error object, optional;

# notes
 - client enriches event with contextual data: bi, request, etc. on your behalf;
 - given received event is invalid, error is written to stderr.
 
# todo
 - add enrichment + tests.
 

