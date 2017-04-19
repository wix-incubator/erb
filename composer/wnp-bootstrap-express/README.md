# wnp-bootstrap-express

Express app container, plugged-in by default to [wnp-bootstrap-composer](../wnp-bootstrap-composer) and surrounds express app with needed middlewares, sets default headers, etc.

## development/production modes

This module detects run mode (NODE_ENV) and depending on:
 - development - does not load config, but instead uses preconfigured `x-seen-by` header value and `publicStaticsUrl`.
 - production - loads required values from config (see `./templates`). 

Module supports config overrides via environment variable. Given environment variables are provided, config will not be loaded. Environment variables:
 - WIX_BOOT_SEEN-BY;
 - WIX_BOOT_PUBLIC_STATICS_URL.

## api
### ({env, config, timeout, newrelic, session, log}) => ...appFns => express

Parameters:
 - env - effective environment;
 - config - preconfigured instance of [wix-config](../../config/wix-config);
 - timeout - default express route timeout;
 - newrelic - preconfigured [newrelic](https://github.com/newrelic/node-newrelic) instance;
 - session - instance of session as produced by [wnp-bootstrap-session](../wnp-bootstrap-session);
 - log - instance of [wnp-debug](../../logging/wnp-debug).
 
It returns a function that accepts an array of functions in a form of `express => Promise.resolve(express) which in turn returns a `Promise` with composed express app. 
