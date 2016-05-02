# wnp-bootstrap-composer-testkit

Testkit for running [bootstrap](../) app as an embedded app within IT tests.

# Install

```
npm install --save-dev wnp-bootstrap-composer-testkit
```

# Usage

```js
'use strict';
const testkit = require('wnp-bootstrap-composer-testkit'),
  expect = require('chai').expect,
  fetch = require('node-fetch');

describe('my tests', function () {
  this.timeout(10000);
  const app = testkit
    .server('./index')
    .beforeAndAfter();

  it('some test', () => 
    fetch(app.getUrl()).then(res => expect(res.ok).to.be.true)
  );
});
```

# Api

## server(app, options)
Factory method for creating new instance of `BootstrapApp`.

## BootstrapApp(app, options)
Class representing embedded bootstrap app.

**Note:** BootstrapApp extends [wix-testkit-base](../../testing/wix-testkit-base) with all related helper functions and capabilities

Parameters:
 - app, required - path to start script relative to project root, ex. './test/app/index' or './index'.
 - options, optional - testkit, environment variables which you can override - provide either partial/complete replacement for default values:
  - timeout, ms - how long testkit is waiting for app to be ready.
  - env - object that is passed to a child process and is accessible via `process.env`. Defaults to `require('env-support').bootstrap()`. Any options passed in will be merged.
 
### BootstrapApp.getUrl(path)
Returns fully qualified url for an app, ex. 'http://localhost:3000/app'.
 
Parameters:
 - path, string, optional - if provided, appends (+ normalizes) to base uri.

### BootstrapApp.getManagementUrl(path)
Returns fully qualified url for an management app, ex. 'http://localhost:3004/app'.
 
Parameters:
 - path, string, optional - if provided, appends (+ normalizes) to base uri.

### BootstrapApp.stdout()
Returns produced stdout as string;

### BootstrapApp.stderr()
Returns produced stderr as string;