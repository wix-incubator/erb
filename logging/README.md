# wix logging

Wix logging is a set of modules to provide:
 - adapters to an existing logging libraries (`wix-logging-*-adapter`);
 - support for creating additional adapters (`wix-logging-client`, `wix-logging-adapter-testkit`);
 - support for enriching logging events with metadata from ex. `express` request context (`wix-logging-client-support`);
 - plugin for `wix-cluster` as a backend which does actual logging event formatting and routing in accordance to ops contract.
 
# typical usage scenario

Say you are using `wix-cluster`, required express middlewares are plugged-in, then your usage would be: 

```js
//this is your app.js
const log4js = require('log4js'),
    
require('wix-logging-log4js-adapter').setup(log4js);

function calledFromSomewhereElse() {
    log4js.getLogger('category').info('something I would like to log');
}
//...
```

Given a proper wiring is done, this logging message will be written to proper place based on environment:
 - dev env - stdout/stderr;
 - prod env - files it service log folder.

# custom logger adapters

You can create one for logging library you like, just see any of the existing ones for inspiration.

# todo
 - switch between dev/prod - stdout/files based on environment variable;
 - actual files + formatting in accordance to current service contract.
 - `wix-logging-client-support` - to support full required metadata: request, bi, etc.