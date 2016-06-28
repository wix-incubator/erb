# wix-log-file-testkit

Provides a log file tailer/interceptor.

## install

```js
npm install --save-dev wix-log-file-testkit
```

## usage

```js
const testkit = require('wix-log-file-testkit'),
  expect = require('chai').expect,
  fs = require('fs');

describe('some', () => {
  const tailer = testkit.interceptor('./log/*.log')
    .beforeAndAfter();
  
  it('should intercept stdout/stderr', () => {
    fs.writeFileSync('./log/one.log', 'one');
    fs.writeFileSync('./log/two.log', 'two');
    
    expect(tailer.out).to.be.string('one');
    expect(tailer.out).to.be.string('two');
  });
});
```

## Api

### interceptor(pattern)
Returns an instance of `WixLogFileTestkit`. 

Patameters:
 - pattern: string, file pattern with possible wildcards to follow multiple files.

### WixLogFileTestkit 
Extends [WixTestkitBase](../wix-testkit-base) which provide start/stop/beforeAndAfter and other capabilities.

#### WixLogFileTestkit.out
Returns a string representing what has been written to log files matching pattern.