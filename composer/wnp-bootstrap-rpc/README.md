# wnp-bootstrap-rpc

A [wnp-bootstrap-composer](../wnp-bootstrap-composer) plugin that adds `rpc` to a `context` where `rpc` is a preconfigured instance of [wix-json-rpc-client](../../rpc/wix-json-rpc-client). 

## development/production modes

This module detects run mode (NODE_ENV) and depending on:
 - development - does not load config, but instead uses preconfigured session key from [wix-rpc-client-support](../../rpc/wix-rpc-client-support).devSigningKey
 - production - loads keys from config (see `./templates`). 

Module supports config overrides via environment variables. Given environment variables are provided, config will not be loaded. Environment variables:
 - WIX_BOOT_RPC_SIGNING_KEY;

## api

### ({env, config, timeout, log, hostname, artifactInfo: {namespace, name}})
Returns [wix-json-rpc-client](../../rpc/wix-json-rpc-client) connected with [wix-rpc-client-support](../../rpc/wix-rpc-client-support).

Parameters:
 - env - effective environment,
 - config - preconfigured instance of [wix-config](../../config/wix-config);
 - log - instance of [wnp-debug](../../logging/wnp-debug).