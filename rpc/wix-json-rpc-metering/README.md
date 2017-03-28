# wix-json-rpc-metering

This module adds metrics to [wix-json-rpc-client](../wix-json-rpc-client/README.md).
The following metrics are reported per service + method:
- invocation meter
- successful execution duration histogram
- errors meter

## Install

```bash
npm install --save wix-json-rpc-metering 
```

## usage
```js
const newRpcClientFactory = require('wix-json-rpc-client').factory,
  WixMeasuredFactory = require('wix-measured'),
  WixStatsdAdapter = require('wix-measured-statsd-adapter'),
  StatsD = require('node-statsd'),
  rpcClientMetering = require('wix-json-rpc-metering');

  // initialize WixMeasured with statsd reporter
  const statsdAdapter = new WixStatsdAdapter(new StatsD({host: 'localhost'}), {interval: 10});
  const wixMeasuredFactory = new WixMeasuredFactory('localhost', 'my-app').addReporter(statsdAdapter);
  
  const rpcClientFactory = newRpcClientFactory();
  
  // add metering support
  rpcClientMetering(wixMeasuredFactory).addTo(rpcClientFactory);
```

## Api
###factory(wixMeasuredFactory): RpcClientMetering
Given instance of [WixMeasuredFactory](../../private/monitoring/wix-measured/README.md) returns 
an instance of `RpcClientMetering`.

###RpcClientMetering#addTo(rpcClientFactory)
Adds metering support to a given `rpcClientFactory`