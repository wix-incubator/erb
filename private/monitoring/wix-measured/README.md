# wix-measured

Metrics library with simplified api and adaptations towards wix infra.

## install

```bash
npm install --save wix-measured
```

## usage

```js
const WixStatsdAdapter = require('wix-measured-statsd-adapter'),
  StatsD = require('node-statsd'),
  WixMeasured = require('wix-measured');

const measured = new WixMeasured({
  app_name: 'my-app',
  host: 'localhost'
});

measured.addReporter(new WixStatsdAdapter(new StatsD({host: 'sensu'}), {interval: 2000}));

measured.meter('reqPerSec', 10);

measured.gauge('random', () => Math.round(Math.random() * 100));
```

## Api

### WixMeasured(tags)
contructor for WixMeasured.

Arguments:
  - tags - tags for metrics key (key/value):
 
Given opts:

```js
const measured = new WixMeasured({
  app_name: 'my-app',
  host: 'localhost'
});

measured.meter('reqPerSec', 10);
```

will result in statsd event with key `app_name=my-app.host=localhost.meter=reqPerSeq`.
  
### WixMeasured.meter(name, value)
Report a statsd meter event; 

### WixMeasured.gauge(name, fnOrValue)
Report a statsd gauge event; gauge value (`fnOrValue`) can be either function that returns a value, or you can set and update value directly which will be read upon publishing. 

### WixMeasured.hist(name, value)
Report a statsd histogram event(s); 

### WixMeasured.collection(tags): WixMeasured
Create a child `WixMeasured` instance with tags appended to parent instances tags and all reporters shared with parent.

### WixMeasured.addReporter(reporter): WixMeasured
Attaches reporter to current metrics, see [wix-measured-statsd-adapter](../wix-measured-statsd-adapter) for example implementation.