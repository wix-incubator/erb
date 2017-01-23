# wnp-bootstrap-composer-testkit

Testkit for running [bootstrap-composer](../) app as an embedded app within IT tests.

# Install

```
npm install --save-dev wnp-bootstrap-composer-testkit
```

# Usage #1 - forked

This scenario is most e2e-like, as it forks app in a separate process, which results in:
 - full isolation from launching node process - no modules/global context shared;
 - possibility to test cluster, uncaught exception scenarios, etc.
 - slower execution, as process fork does not come for free.
 - potentially possible to run tests in parallel.

Given `./index.js`:
```js
const Composer = require('wnp-bootstrap-composer').Composer;

new Composer().start();
```

`./test/index.spec.js`
```js
const testkit = require('wnp-bootstrap-composer-testkit'),
  expect = require('chai').expect,
  fetch = require('node-fetch');

describe('my tests', function () {
  this.timeout(10000);
  const app = testkit.server('./index').beforeAndAfter();

  it('some test', () => 
    fetch(app.getUrl()).then(res => expect(res.ok).to.equal(true))
  );
});
```

# Usage #2 - embedded

Same as `forked` but instead runs app in same process with benefits:
 - debugging works;
 - faster start/runtime;

And drawbacks:
 - pollution of environment (`process.env`);
 - dodgy restarting of app;
 - impact on app from from host process (globals, etc.);

Given `./index.js`:
```js
const Composer = require('wnp-bootstrap-composer').Composer;

new Composer().start();
```

`./test/index.spec.js`
```js
const testkit = require('wnp-bootstrap-composer-testkit'),
  expect = require('chai').expect,
  fetch = require('node-fetch');

describe('my tests', function () {
  this.timeout(10000);
  const app = testkit.app('./index').beforeAndAfter();

  it('some test', () => 
    fetch(app.getUrl()).then(res => expect(res.ok).to.equal(true))
  );
});
```

# Api

## server(appFile, options): BootstrapApp
Factory method for creating new instance of `ServerApp` for running provided service entry point in a forked process.

Parameters:
 - appFile, required - path to start script relative to project root, ex. './test/app/index' or './index'.
 - options, optional - testkit, environment variables which you can override - provide either partial/complete replacement for default values:
  - timeout, ms - how long testkit is waiting for app to be ready.
  - env - object that is passed to a child process and is accessible via `process.env`. Defaults to `require('env-support').bootstrap()`. Any options passed in will be merged.

## app(appFile, options): BootstrapApp
Factory method for creating new instance of `EmbeddedServer` for running provided service entry point in a forked process.

Parameters:
 - appFile, required - path to start script relative to project root, ex. './test/app/index' or './index'.
 - options, optional - testkit, environment variables which you can override - provide either partial/complete replacement for default values:
  - timeout, ms - how long testkit is waiting for app to be ready.
  - env - object that is injected into current `process.env`.


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

### BootstrapApp.output
Returns produced stderr and stdout as string;

### BootstrapApp.env
Returns injected environment.