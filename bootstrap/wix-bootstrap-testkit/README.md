# wix-bootstrap-testkit

Testkit for running [bootstrap](../) app as an embedded app within IT tests.

# Install

```
npm install --save-dev wix-bootstrap-testkit
```

# Usage #1 - forked

This scenario is most e2e-like, as it forks app in a separate process, which results in:
 - full isolation from launching node process - no modules/global context shared;
 - possibility to test cluster, uncaught exception scenarios, etc.
 - slower execution, as process fork does not come for free.
 - not debuggable, as most debuggers do not place nicely with process hierarchies.
 - potentially possible to run tests in parallel.

Given `./index.js`:
```js
const bootstrap = require('wix-bootstrap-ng');

bootstrap().start();
```

`./test/index.spec.js`
```js
'use strict';
const testkit = require('wix-bootstrap-testkit'),
  expect = require('chai').expect,
  fetch = require('node-fetch');

describe('my tests', function () {
  this.timeout(10000);
  const app = testkit.server('./index').beforeAndAfter();

  it('some test', () => 
    fetch(app.getUrl('/health/is_alive')).then(res => expect(res.ok).to.be.true)
  );
});
```

# Usage #2 - embedded

This scenario allows to use different mocking techniques and debugging:
 - shares globals and module cache with current process (test scope);
 - node cluster will break start/stop functionality.
 - fast execution, as no process is forked;
 - parallel execution might give mixed results (global exception handlers are shared, global state, etc.);

Given `./app.js`:
```js
const bootstrap = require('wix-bootstrap-ng');

module.exports = opts => bootstrap().start(opts);
```

`./index.js`:
```js
require('./app')();
```

`./test/index.spec.js`
```js
'use strict';
const testkit = require('wix-bootstrap-testkit'),
  expect = require('chai').expect,
  fetch = require('node-fetch');

describe('my tests', function () {
  this.timeout(10000);
  const app = testkit.app(require('../app')).beforeAndAfter();

  it('some test', () => 
    fetch(app.getUrl('/health/is_alive')).then(res => expect(res.ok).to.be.true)
  );
});
```

# Api

## server(appFile, options)
Factory method for creating new instance of `BootstrapApp` for running provided service entry point in a forked process.

Parameters:
 - appFile, required - path to start script relative to project root, ex. './test/app/index' or './index'.
 - options, optional - testkit, environment variables which you can override - provide either partial/complete replacement for default values:
  - timeout, ms - how long testkit is waiting for app to be ready.
  - env - object that is passed to a child process and is accessible via `process.env`. Defaults to `require('env-support').bootstrap()`. Any options passed in will be merged.

## app(appFn, options)
Factory method for creating new instance of `BootstrapApp` for running provided function as embedded app.

Parameters:
 - appFn, required - function, that upon invocation with options for [wix-bootstrap-ng](../../bootstrap-ng/wix-bootstrap-ng) `start` function will return a stoppable - function that stops the app.
 - env - object that is passed to an app and is accessible via `process.env`. Defaults to `require('env-support').bootstrap()`. Any options passed in will be merged.

## BootstrapApp
Class representing embedded bootstrap app.

**Note:** BootstrapApp extends [wix-testkit-base](../../testing/wix-testkit-base) with all related helper functions and capabilities
 
### BootstrapApp.getUrl(path)
Returns fully qualified url for an app, ex. 'http://localhost:3000/app'.
 
Parameters:
 - path, string, optional - if provided, appends (+ normalizes) to base uri.

### BootstrapApp.getManagementUrl(path)
Returns fully qualified url for an management app, ex. 'http://localhost:3004/app'.
 
Parameters:
 - path, string, optional - if provided, appends (+ normalizes) to base uri.

### BootstrapApp.stdout
Returns produced stdout as string;

### BootstrapApp.stderr
Returns produced stderr as string;

### BootstrapApp.output
Returns produced stderr and stdout as string;

### BootstrapApp.env
Returns injected environment.