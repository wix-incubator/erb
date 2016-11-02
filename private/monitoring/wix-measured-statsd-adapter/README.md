# wix-measured-statsd-adapter

Adapts wix-measured to node-statsd.

## install

```bash
npm install --save wix-measured-statsd-adapter
```

## usage

```js
const WixStatsdAdapter = require('wix-measured-statsd-adapter'),
  StatsD = require('node-statsd'),
  WixMeasured = require('wix-measured');

const measured = new WixMeasured({
  tags: {
    app_name: 'my-app',
    host: 'localhost'
  }
});

//attaches reporter to measured with 2s send to statsd interval. 
measured.addReporter(new WixStatsdAdapter(new StatsD({host: 'sensu'}), {interval: 2000}));

measured.meter('reqPerSec', 10);
```

## Api

### WixMeasuredStatsDAdapter(statsd, {interval: 2000})
Contructor of `WixMeasuredStatsDAdapter`.

Arguments:
  - statsd - preconfigured instance of [statsd](https://github.com/sivy/node-statsd);
    - opts
      - interval - publish interval in ms, defaults to 30000.
 
### WixMeasuredStatsDAdapter.addTo(measured): WixMeasuredStatsDAdapter
Attaches itself to `wix-measured`. 

### WixMeasuredStatsDAdapter.stop()
Stops publisher and flushes metrics of attched `wix-measured` instance.
