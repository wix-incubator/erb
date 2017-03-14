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
const collection = new WixMeasuredFactory('localhost', 'anApp')
    .collection('collectionKey', 'collectionValue');

const metering = new WixMetering(collection);

metering.promise('fn', 'name')(() => Promise.resolve('ok')); //will publish histogram on 'collectionKey=collectionValue.fn=name'

metering.promise('fn', 'name')(() => Promise.reject(new Error('woop'))); //will publish meter (rate, count) on 'collectionKey=collectionValue.fn=name.error=Error.code=-100'.

const {} 
```

## Api

### WixMetering(WixMeasuredClient): WixMetering
constructor for WixMetering.

Arguments:
  - client - an instance of `WixMeasuredClient`.
 
### WixMeasuredFactory.promise(key, value): (() => Promise): Promise
Wraps a function that returns a promise and reports metrics for fn execution.

### WixMeasuredFactory#raw(key, value): Object
Returns an object with two callbacks for metrics collection.
- `reportDuration(millis)` - report success, measure duration
- `reportError(err)` - report failure