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
  WixMeasuredFactory = require('wix-measured');

const measuredClient = new WixMeasuredFactory('localhost', 'anApp') //crete factory
    .addReporter(new WixStatsdAdapter(new StatsD({host: 'sensu'}), {interval: 2000})) //add statsd reporter
    .collection('collectionKey', 'collectionValue'); //create collection

measured.meter('reqPerSec')(10); //send meter of 10 for 'meter=reqPerSec'.

measured.gauge('random')(() => Math.round(Math.random() * 100));//send gauge for every reporter interval on key 'gauge=random'
```

## Api

### WixMeasuredFactory(host, appName): WixMeasuredFactory
constructor for WixMeasuredFactory.

Arguments:
  - host - string, mandatory, hostname of an app;
  - appName - string, mandatory, application name;
 
Given opts:
```js
const measured = new WixMeasuredFactory('local', 'my-app').collection('key', 'value');

measured.meter('reqPerSec')(10);
```

will result in statsd event with key `root=node_app_info.host=local.app_name=my_app.key=value.meter=reqPerSec`.

### WixMeasuredFactory.collection(key, value): WixMeasured
creates a `WixMeasured` instance with postfix `${key}=${value}`.

### WixMeasuredFactory.addReporter(reporter): WixMeasuredFactory
Attaches reporter to current metrics, see [wix-measured-statsd-adapter](../wix-measured-statsd-adapter) for example implementation.

### WixMeasured.meter([key], name)(value)
returns a function that will report a meter under `meter=${name}` if key is not provided or `${key}=${name}`.

### WixMeasured.gauge(name)(fnOrValue)
returns a function that will report a gauge under `gauge=${name}`.

gauge value `fnOrValue` can be either function that returns a value, or you can set and update value directly which will be read upon publishing.

### WixMeasured.hist([key], name)(value)
returns a function that will report a histogram under `hist=${name}` if key is not provided or `${key}=${name}`.
