# wnp-bootstrap-statsd

[wix-bootstrap-ng](../../bootstrap/wix-bootstrap-ng) plugin that enables publishing of metrics to statsd (anodot). 

This plugin comes bundled with [wix-bootstrap-ng](../../bootstrap/wix-bootstrap-ng) or can be plugged-in to [wnp-bootstrap-composer](../wnp-bootstrap-composer) via `use`. 

## development/production modes

This module detects run mode (NODE_ENV) and depending on:
 - development - does not load config, but instead uses defaults ('localhost' for statsd host).
 - production - loads keys from configs (see `./templates`). 

Module supports config overrides via environment variable. Given environment variables are provided, config will not be loaded. Environment variables:
 - WIX_BOOTSTRAP_STATSD_HOST - statsd host;
 - WIX_BOOTSTRAP_STATSD_INTERVAL - publishing interval to statsd.

Note: both env variables must be provided to skip config loading.

## install

```bash
npm install --save wnp-bootstrap-statsd
```

## api
### di
Does not add anything to app context, but instead adds adapter to `metrics` instance.