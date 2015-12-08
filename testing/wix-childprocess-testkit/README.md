# wix-childproces-testkit

Testkit for spawning node apps as separate processes with possibility to:
 - access stdout/stderr;
 - use one of the existing or provide custom checks if app has started;

It gives you:
 - mocha compliant helpers: start/stop/beforeAndAfter/beforeAndAfterEach;
 - clean-up of stale processes (ex. on mocha timeout child processes might not be killed).

# Install

```
npm install --save-dev wix-childproces-testkit
```

# Usage

Given you have an app(`./test/test-app.js`):

```js
'use strict';
require('express')()
  .get(process.env.MOUNT_POINT, (req, res) => res.end())
  .listen(process.env.PORT);
```

Then in your test you can do:

```js
'use strict';
const request = require('request'),
  expect = require('chai').expect,
  testkit = require('wix-childproces-testkit');

const env = require('env-support').basic();

describe('embedded app', () => {
  testkit
    .embeddedApp(`./test/test-app.js`, {env}, testkit.checks.httpGet('/'))
    .beforeAndAfter();

  it('should work', done => {
    request(`http://localhost:${env.PORT}${env.MOUNT_POINT}`, (error, response) => {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });
});
```

Note that:
 - it uses helper `beforeAndAfter()` to start/stop app around tests;
 - it uses built-in `httpGet(path)` helper for alive check.
 - it embeds special watchers both on parent/child processes for watching/killing stale processes.

# Api

Factory methods:
 - **embeddedApp(app, options, aliveCheck)** - returns a new instance of `EmbeddedApp`;
 - **checks.http(options, passed)** - returns a new instance of `HttpCheck`;
 - **checks.httpGet(path)** - returns a new instance of `HttpGetCheck`;
 - **checks.stdOut(str)** - returns a new instance of `StdOutCheck`;
 - **checks.stdErr(str)** - returns a new instance of `StdErrCheck`;

## EmbeddedApp(app, options, aliveCheck)
Class, where constructor accepts parameters:

 - app, string, mandatory - path of an app .js file relative to your project root, ex. `./test/apps/app.js`;
 - options, object, mandatory:
  - timeout - integer, optional defaults to 10s. how long `start()` will wait for app to be ready, or otherwise for `aliveCheck` to return true;
  - env - environment object that will be passed on to started app - keys/values will be available under `process.env.*`;
 - aliveCheck, object that exposes function `invoke` - `invoke` is called multiple times and must call either `success` or `failure` callback upon completion.
 
**aliveCheck** is an object exposing single function:

```
{
    invoke: (context, success, failure) => success()
}
```
 
Where parameters are:

 - context: object passed to a function with keys:
  - env - environment passed for a `EmbeddedApp`;
  - stdout() - function returning array of logged lines to stdout;
  - stderr() - function returning array of logged lines to stderr;
 - success() - callback to be called given app is up;
 - failure(err) - callback to be called given app is not yet up.

**Instance methods:**

 - **EmbeddedApp.start()** - starts embedded app and returns a `Promise`;
 - **EmbeddedApp.stop()** - stops embedded app and returns a `Promise`;
 - **EmbeddedApp.clearStdOutErr()** - clears saved stdout/stderr streams;
 - **EmbeddedApp.beforeAndAfter()** - registers mocha `before` and `after` hooks for starting and stopping (clearing output as well) tests around test-suite; 
 - **EmbeddedApp.beforeAndAfterEach()** - registers mocha `beforeEach` and `afterEach` hooks for starting and stopping (clearing output as well) tests around each test;
 - **EmbeddedApp.stdout()** - array with lines of stdout stream from spawned process;
 - **EmbeddedApp.stderr()** - array with lines of stderr stream from spawned process;
 - **EmbeddedApp.env** - getter for an effective env passed to a child process;

## HttpCheck(options, passed)
Class, which can execute arbitrary http request (as defined in `options`) and invokes `passed` to verify success/failure:
 - options - required, object to be passed to [request module](https://www.npmjs.com/package/request);
 - passed - function with arguments `(err, res, body)` that must return true given app is running and false otherwise.

Example:

```js
const _ = require('lodash');

const check = require('wix-childproces-testkit').checks.http(
  { method: 'get', uri: 'http://localhost:8080/app/test' },
  (err, res, body) => (_.isNull(err) && (res && res.statusCode >= 200 && res.statusCode < 300)));
...
```
 
## HttpGetCheck(path)
Class, which executes http get request on path (relative to app base-path as defined in `env` provided to `EmbeddedApp`). Note that this check requires PORT, MOUNT_POINT to be present in `env`.

Arguments:
 - path - relative path, ex.: '/resource'.
 
Example:

```js
const check = require('wix-childproces-testkit').checks.httpGet('/');
...
```

## StdOutCheck(str)
Class, which checks if forked apps stdout contains provided `str`;

Arguments:
 - str - string.
 
## StdErrCheck(str)
Class, which checks if forked apps stderr contains provided `str`;

Arguments:
 - str - string.