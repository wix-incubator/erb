# wix-bootstrap-testkit

Testkit for running [bootstrap](../) app as an embedded app within IT tests.

# Install

```
npm install --save-dev wix-bootstrap-testkit
npm install --save-dev env-support
```

# Usage

```js
'use strict';
const testkit = require('wix-bootstrap-testkit'),
  envSupport = require('env-support'),
  expect = require('chai').expect,
  request = require('request');

describe('my tests', function () {
  this.timeout(5000);
  const app = testkit.bootstrapApp('./index.js', {env: envSupport.basic()})
  
  app.beforeAndAfter();

  it('some test', done => {
    request.get(app.getUrl(), (err, res) => {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });
});
```

# Api

## bootstrapApp(app, options)
Factory method for creating new instance of `BootstrapApp`.

## BootstrapApp(app, options)
Class representing embedded bootstrap app.

Parameters:
 - app, required - path to start script relative to project root, ex. './test/app/index.js' or './index.js'.
 - options, optional - testkit, environment variables which you can override - provide either partial/complete replacement for default values:
  - timeout, ms - how long testkit is waiting for app to be ready.
  - env - object that is passed to a child process and is accessible via `process.env`.
   - PORT, int - port on which app is listening;
   - MOUNT_POINT, string - mount point of an app;
   - MANAGEMENT_PORT, int - listen port for management app;
   - APP_NAME, string - name of the app.
 
### BootstrapApp.beforeAndAfter()
Registers mocha `before` and `after` hooks for starting-up/shutting down bootstrap app.

### BootstrapApp.getUrl(path)
Returns fully qualified url for an app, ex. 'http://localhost:3000/app'.
 
Parameters:
 - path, string, optional - if provided, appends (+ normalizes) to base uri.

### BootstrapApp.getManagementUrl(path)
Returns fully qualified url for an management app, ex. 'http://localhost:3004/app'.
 
Parameters:
 - path, string, optional - if provided, appends (+ normalizes) to base uri.

### BootstrapApp.stdout()
Returns array of log lines written to stdout;

### BootstrapApp.stderr()
Returns array of log lines written to stderr;

### BootstrapApp.env
Returns object representing effective environment in a form or:

```js
env: {
  PORT: 3000,
  MANAGEMENT_PORT: '3004',
  MOUNT_POINT: '/app',
  APP_NAME: 'app'
}
```