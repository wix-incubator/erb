# wix-childprocess-testkit

Provides [wix-cluster](../../cluster/wix-cluster) as a child process support for tests.

## install

```js
npm install --save-dev wix-childprocess-testkit
```

## usage

1. create your application
2. create your test
3. facilitate custom messaging

### Create your application

The only requirement from the app is to send a ```listening``` signal to the parent process when it is ready for the tests. The testkit
 waits for one or more ```listening``` signals -

1. by default it waits for a single ```listening``` signal.
2. for clustered applications with more then one worker, it waits for env.workerCount ```listening``` signals.

To facilitate the ```listening``` signal automatically, one can include in the cluster application the ```testNotifier``` plugin -
  ```require('wix-childprocess-testkit').testNotifierPlugin```.

Assuming you create your application in the ./test/apps/ folder, a typical app will include a cluster launcher file and
an express app file.

The launcher

```js
'use strict';
var app = require('./app'),
  wixClusterBuilder = require('wix-cluster').builder,
  testNotifier = require('wix-childprocess-testkit').testNotifierPlugin;

wixClusterBuilder(app)
  .withWorkerCount(1)
  .addPlugin(testNotifier())
  .start();
```

The app

```js
'use strict';
const express = require('express');


module.exports = function () {
  const app = express();

  app.get('/', function(req, res) {
    res.write('Hello');
    res.end();
  });

  app.listen(3000);
  console.log('App listening on port: %s', 3000);
};
```

### Create your test

A test using the testkit needs only include the testkit ```withApp``` function and wrap the test.

```js
'use strict';
const
  expect = require('chai').expect,
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  rp = require('request-promise'),
  withApp = require('wix-childprocess-testkit').withApp;

chai.use(chaiAsPromised);

describe('a suite', () => {
  it('a test', withApp('./test/apps/launcher.js', [], {workerCount: 1}, (app) => {
    return rp('http://localhost:3000')
      .then(res => {
        expect(res).to.be.equal('Hello');
      });
  }));
```

## Api

### withApp(app, params, env, testFunc)
Wraps a test with a sequence of app startup, do test (the testFunc), close app.

* app - [String] the relative path to the app main module
* params - [Array] command line parameters to send to the app
* env - [Object] environment parameters to set when running the app
* testFunc - [Function<App>] test callback. The App parameter is an EmbeddedApp instance

### testNotifierPlugin([callback])
Function returning a wix cluster plugin responsible to tell the test process about what happens with the wix cluster
 process.

The optional callback parameter allows the application (the cluster master) to also listen on the cluster events.

