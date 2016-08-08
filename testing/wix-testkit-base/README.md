# wix-testkit-base

Provides base class to be used by testkits/test-servers to provide:
 - unified contract via helpers in a form of `beforeAndAfter`, `beforeAndAfterEach` that work both for [mocha](https://mochajs.org/) and [jasmine](http://jasmine.github.io/). 
 - safeguards against multiple starts, stopping not started container, etc.;
 - can be used outside of 'describe' blocks.

## install

```bash
npm install --save-dev wix-testkit-base
```

## usage

Given you want to provide a testkit, just extend your class like:

```js
const tb = require('wix-testkit-base');

class MyTestkit extends tb.TestkitBase {

  doStart() {
    return Promise.resolve();
  }

  doStop() {
    return Promise.resolve();
  }
}


module.exports = MyTestkit;
```

And later on you can use it like:

```js
const MyTestkit = require('..');

describe('test block', () => {
  const server = new MyTestkit().beforeAndAfter();

  it('test', () => {
    //server is started.  
  });

});
```

## Api

### TestkitBase
Base class to be extended, where extendee has to implement 2 functions:
 - doStart() - returning Promise;
 - doStop() - returning Promise;

#### TestkitBase.start(done): Promise
Starts a service. Accepts optional callback and returns a Promise if no callback is provided.

#### TestkitBase.stop(done): Promise
Stops a service. Accepts optional callback and returns a Promise if no callback is provided.

#### TestkitBase.beforeAndAfter(timeout): this
Adds hooks to mocha/jasmine to start/stop service around tests, returns self. Can be used outside of describe block.

Parameters:
 - timeout: ms, optional - explicit timeout for start/stop operations.

#### TestkitBase.beforeAndAfterEach(timeout): this
Adds hooks to mocha/jasmine to start/stop service around each test, returns self.  Can be used outside of describe block.

Parameters:
 - timeout: ms, optional - explicit timeout for start/stop operations.