# wix-stdouterr-testkit

Provides an stdout/stderr interceptor with scoping around single/all tests.

## install

```bash
npm install --save-dev wix-stdouterr-testkit
```

## usage

```js
const testkit = require('wix-stdouterr-testkit'),
  expect = require('chai').expect;

describe('some', () => {
  const stdouterr = testkit.interceptor()
    .beforeAndAfter();
  
  it('should intercept stdout/stderr', () => {
    console.info('this is info log');
    console.error('this is error');
    
    expect(stdouterr.stdout).to.be.string('this is info log');
    expect(stdouterr.stderr).to.be.string('this is error');
  });
});
```

## Api

### interceptor(options)
Returns an instance of `WixStdOutErrTestkit`. 

### WixStdOutErrTestkit 
Extends [WixTestkitBase](../wix-testkit-base) which provide start/stop/beforeAndAfter and other capabilities.

#### WixStdOutErrTestkit.stdout
Returns a string representing what has been written to stdout.

#### WixStdOutErrTestkit.stderr
Returns a string representing what has been written to stderr.

#### WixStdOutErrTestkit.output
Returns a string representing what has been written to stdout + stderr.