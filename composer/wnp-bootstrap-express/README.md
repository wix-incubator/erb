# wnp-bootstrap-express

Express app container, plugged-in by default to [wix-bootstrap](../wix-bootstrap) and surrounds express app with needed middlewares, sets default headers, etc.

## development/production modes

This module detects run mode (NODE_ENV) and depending on:
 - development - does not load config, but instead uses preconfigured `x-seen-by` header value.
 - production - loads required values from config (see `./templates`). 

Module supports config overrides via environment variables. Given environment variables are provided, config will not be loaded. Environment variables:
 - WIX-BOOT-EXPRESS-SEEN-BY

## install

```bash
npm install --save wnp-bootstrap-express
```

## usage

Given you are developing custom app using [wnp-bootstrap-composer](../wnp-bootstrap-composer), you can plug-in this app as `options.composers.mainExpress` via constructor:

```js
const express = require('wnp-bootstrap-express'),
  Composer = require('wnp-bootstrap-composer');
  
const instance = new Composer({composers: {managementExpress: express()}});
```

## api
### (opts): (context, apps) => express
Given `opts` returns a function pluggable to [wnp-bootstrap-composer](../wnp-bootstrap-composer) as main app container.

Parameters:
 - opts, object, optional with keys:
   - timeout: number, ms - timeout override, defaults to 1000ms.