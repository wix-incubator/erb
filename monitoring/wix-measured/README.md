# wix-measured

A simple wrapper for the measured (node-measured) NPM library adding to it the RDB Histogram patch.
The collections API is exactly as the measured API with the exception of the histogram - which uses the RDB histogram API.

## install

```javascript
npm install --save wix-measured
```

## usage

```js

// default collection
const metrics = require('../').default;

// alternate collection
const alternate = require('../').collection('alternate');

// with a collection, report statistics just like measured
metrics.counter('name').inc(n);
metrics.counter('name').dec(n);
metrics.counter('name').reset();

metrics.guage('name', () => number);

metrics.meter('name').mark(n);
metrics.meter('name').reset();

// note the histogram is the RDB Histogram, not the measured (or metrics histogram)
metrics.histogram('name').update(value);

var t1 = metrics.timer('name').start();
// some action
t1.end();


```

## Api

### defualt
get the default measured collection

### collection(name)
get a named measured collection
