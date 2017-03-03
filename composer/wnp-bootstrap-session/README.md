# wnp-bootstrap-session

[wix-bootstrap-composer](..wnp-bootstrap-composer) module that adds `session` to a `context` where `session` is a preconfigured instance of [wix-session-crypto](../../security/wix-session-crypto). 

## development/production modes

This module detects run mode (NODE_ENV) and depending on:
 - development - does not load config, but instead uses preconfigured session key from  [wix-session-crypto](../../security/wix-session-crypto).devKey
 - production - loads keys from configs (see `./templates`). 

Module supports config overrides via environment variable. Given environment variable is provided, config will not be loaded. Environment variable:
 - WIX_BOOT_SESSION2_KEY - for session (wixSession2 cookie).


## api
### ({env, config, log}): sessionDecryptor
Function that takes arguments:
 - env - effective environment;
 - config - preconfigured instance of [wix-config](../../config/wix-config);
 - log - instance of [wnp-debug](../../logging/wnp-debug).

Returns object with:
 - v1 - 'wixSession' decoder;
 - v2 - 'wixSession2' decoder.
