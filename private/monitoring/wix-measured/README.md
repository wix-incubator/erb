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

const measured = new WixMeasured('localhost', 'anApp');

measured.addReporter(new WixStatsdAdapter(new StatsD({host: 'sensu'}), {interval: 2000}));

measured.meter('reqPerSec', 10);

measured.gauge('random', () => Math.round(Math.random() * 100));
```

## Api

### WixMeasured(host, appName)
contructor for WixMeasured.

Arguments:
  - host - string, mandatory, hostname of an app;
  - appName - string, mandatory, application name;
 
Given opts:

```js
const measured = new WixMeasured('local', 'my-app');

measured.meter('reqPerSec', 10);
```

will result in statsd event with key `root=node_app_info.host=local.app_name=my_app`.
  
### WixMeasured.meter(name, value)
Report a statsd meter event; 

### WixMeasured.gauge(name, fnOrValue)
Report a statsd gauge event; gauge value (`fnOrValue`) can be either function that returns a value, or you can set and update value directly which will be read upon publishing. 

### WixMeasured.hist(name, value)
Report a statsd histogram event(s); 

### WixMeasured.collection(...tags): WixMeasured
Create a child `WixMeasured` instance with tags appended to parent instances tags and all reporters shared with parent.

tags must be in a format of `key=value`. Note that tag is validated/normalized based on rules:
 - '.' replaced with '_';
 - '-' replaced with '_';
 - first '=' is treated as divisor between key/value, others are replaced with '_';
 - at least single '=' is mandatory;
 - key and value are mandatory;

### WixMeasured.addReporter(reporter): WixMeasured
Attaches reporter to current metrics, see [wix-measured-statsd-adapter](../wix-measured-statsd-adapter) for example implementation.
