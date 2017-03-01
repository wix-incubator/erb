# wix-measured-metering

Metrics library with simplified api and adaptations towards wix infra.

## install

```bash
npm install --save wix-measured-metering
```

## usage

```js
const WixMeasuredFactory = require('wix-measured'),
  WixMetering = require('wix-measured-metering');

//should also have a reporter
const colleciton = new WixMeasuredFactory('localhost', 'anApp')
    .collection('collectionKey', 'collectionValue');

const meter = new WixMetering(colleciton);

meter.promise('fn', 'name')(() => Promise.resolve('ok')); //will publish histogram on 'collectionKey=collectionValue.fn=name'

meter.promise('fn', 'name')(() => Promise.reject(new Error('woop'))); //will publish meter (rate, count) on 'collectionKey=collectionValue.fn=name.error=Error.code=-100'.
```

## Api

### WixMetering(WixMeasuredClient): WixMetering
constructor for WixMetering.

Arguments:
  - client - an instance of `WixMeasuredClient`.
 
### WixMeasuredFactory.promise(key, value): (() => Promise): Promise
Wraps a function that returns a promise and reports metrics for fn execution.