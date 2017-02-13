# wnp-bootstrap-petri

A [wnp-bootstrap-composer](../wnp-bootstrap-composer) module that provides a preconfigured instance of [wix-petri-client](../../petri/wix-petri-client).

## development/production modes

This module detects run mode (NODE_ENV) and depending on:
 - development - does not load config, but instead uses petri server url: `http://localhost:3020`.
 - production - loads service url from config (see `./templates`). 

Module supports config overrides via environment variables. Given environment variables are provided, config will not be loaded. Environment variables:
 - WIX_BOOT_LABORATORY_URL;

## api

### ({env, config, log, rpc})
Returns a preconfigured instance of [wix-petri-client](../../petri/wix-petri-client).

Parameters:
 - env - effective environment,
 - config - preconfigured instance of [wix-config](../../config/wix-config);
 - log - instance of [wnp-debug](../../logging/wnp-debug);
 - rpc - instance of [wnp-bootstrap-rpc](../wnp-bootstrap-rpc).