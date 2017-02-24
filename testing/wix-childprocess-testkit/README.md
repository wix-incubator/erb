# wix-childproces-testkit

Testkit for spawning apps as separate processes with:
 - extra logic to avoid zombie processes;
 - api in a form of [WixTestkitBase](../wix-testkit-base);
 - pluggable checks for detecting when process has started;

# Install

```
npm install --save-dev wix-childprocess-testkit
```

# Usage

Given you have an app(`./test/test-express-app.js`):

```js
'use strict';
require('express')()
  .get(process.env.MOUNT_POINT, (req, res) => res.end())
  .listen(process.env.PORT);
```

Then in your test you can do:

```js
'use strict';
const fetch = require('node-fetch'),
  expect = require('chai').expect,
  testkit = require('wix-childprocess-testkit');

const env = require('env-support').basic();

describe('embedded app', () => {
  testkit
    .fork(`./test/test-express-app.js`, {env}, testkit.checks.httpGet('/'))
    .beforeAndAfter();

  it('should work', () => 
    fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}`)
      .then(res => expect(res.status).to.equal(200))
  );
});
```

# alive checks

Testkit allows to plug-in functions that are used to determine when forked/spawned process is deemed to be ready (started). There is a selection of predefined checks that you can find in `Api` section, but gist of it would be:

```
function StdErrOutCheck(str) {
  return checkOpts => new Promise((resolve, reject) => {
    if (checkOpts.output.indexOf(str) < 0) {
      reject(new Error(`'${str}' not found in stdout+stderr`));
    } else {
      resolve();
    }
  })
}
```

where `checkOpts` is an object with:
 - env: effective environment passed to forked/spawned service.
 - output: combined stdout+stderr produced by service.

Note that check is tried multiple times and process is considered to be alive once check passes.

# Api

## fork(app, opts, aliveCheck): WixChildProcessTestkit
Factory to create an instance of `WixChildProcessTestkit` that will fork a node app.

Arguments:
 - app, string, mandatory - path of an app .js file relative to your project root, ex. `./test/apps/express-app.js`;
 - options, object, mandatory:
  - timeout - integer, optional defaults to 10s. how long `start()` will wait for app to be ready, or otherwise for `aliveCheck` to return true;
  - env - environment object that will be passed on to started app - keys/values will be available under `process.env.*`;
  - cwd - current working directory of the child process;
 - aliveCheck - function that returns a fulfilled promise when app is deemed to be alive and failed promise otherwise.

## spawn(args, opts, aliveCheck): WixChildProcessTestkit
Factory to create an instance of `WixChildProcessTestkit` that will fork any process/app.

Arguments:
 - args, array, mandatory - command line args to launch app, ex. `['read', '-p', 'ready']`;
 - options, object, mandatory:
  - timeout - integer, optional defaults to 10s. how long `start()` will wait for app to be ready, or otherwise for `aliveCheck` to return true;
  - env - environment object that will be passed on to started app - keys/values will be available under `process.env.*`;
  - cwd - current working directory of the child process;
 - aliveCheck - function that returns a fulfilled promise when app is deemed to be alive and failed promise otherwise.

## WixChildProcessTestkit.child
Child process instance. Available on running app.

## WixChildProcessTestkit.kill(signal)
Send child process a signal - SIGTERM, SIGKILL...

## WixChildProcessTestkit.isRunning: boolean
true/false depending if app is running

## WixChildProcessTestkit.env
Effective environment that was passed to forked/spawned process.

## WixChildProcessTestkit.output
String containing stdout and stderr concatenated into single string.

## WixChildProcessTestkit.*
start(), stop(), beforeAndAfter(), beforeAndAfterEach() - functions inherited from `WixTestkitBase`.

## checks.http(url, opts): checkOpts => {}
An 'aliveCheck' that does an http [method] for given url and expects a 2xx response.

Parameters:
 - url - full url of endpoint to check;
 - opts - pass-through options for `node-fetch`.

## checks.httpGet(path): checkOpts => {}
An 'aliveCheck' that executes http get request on path (relative to app base-path as defined in `env` provided to `EmbeddedApp`). Note that this check requires PORT, MOUNT_POINT to be present in `env`.

Arguments:
 - path - relative path, ex.: '/resource'.
 
Example:

```js
const check = require('wix-childproces-testkit').checks.httpGet('/');
```

## checks.stdErrOut(str): checkOpts => {}
An 'aliveCheck' that expects provided 'str' to be available in stdout+stderr. 