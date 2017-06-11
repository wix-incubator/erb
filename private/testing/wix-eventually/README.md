# wix-eventually

Retries a function that returns a promise.

Uses defaults:
 - timeout: 10s;
 - interval: 200ms;

## install

```js
npm install --save-dev wix-eventually
```

## usage

```js
const eventually = require('wix-eventually'),
  expect = require('chai').expect;

describe('example', () => {

  it('should retry', () => {
    let hasCompleted = false;
  	setTimeout(() => hasCompleted = true, 1000);

  	return Promise.resolve()  	  
  	  .then(() => eventually(() => expect(hasCompleted).to.equal(true));
  });
});
```

## Api

### (fn, opts): Promise
Wraps a promise that retries a function n times with 200 ms delay in between;

Arguments:
 - fn - sync function or thenable.
 - opts - optional object with:
   - timeout - timeout for retrying, ms;
   - interval - retry interval, ms.

### with(defaults): (fn, opts)
Returns a function with provided `defaults` - {timeout, interval}.

