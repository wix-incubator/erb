# wnp-bootstrap-statsd

<odule that enables publishing of metrics to statsd. 

This plugin comes bundled with [wnp-bootstrap-composer](../wnp-bootstrap-composer). 

## development/production modes

This module detects run mode (NODE_ENV) and depending on:
 - development - does not load config, but instead uses defaults ('localhost' for statsd host).
 - production - loads keys from configs (see `./templates`). 

Module supports config overrides via environment variable. Given environment variable `WIX_BOOT_STATSD_HOST` is set, config will not be loaded. `WIX_BOOT_STATSD_INTERVAL` overrides publisng to statsd interval.

## api
### ({env, config, log, measuredFactory, shutdownAssembler})
Adds statsd publisher, configures cluster master and adds a shutdown hook.

Parameters:
 - env - effective environment;
 - config - preconfigured instance of [wix-config](../../config/wix-config);
 - log - instance of [wnp-debug](../../logging/wnp-debug);
 - measuredFactory - instance of [wix-measured](../../private/monitoring/wix-measured) factory;
 - shutdownAssembler - instance of `shutdownAssembler` from within [wnp-bootstrap-composer](../wnp-bootstrap-composer).