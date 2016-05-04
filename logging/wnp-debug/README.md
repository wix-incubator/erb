# wnp-debug

Simple wrapper on top of [debug](https://www.npmjs.com/package/debug) with features:
 - infers debug key from module name;
 - has functions to log to out/err streams;

## install

```js 
npm install --save wnp-debug
```

## usage

Given you have module named `wnp-some-module` or `wix-some-module`:

```js
const log = require('wnp-debug')(
)

log.info('info msg'); //logs to stdout with key wnp:some-module or wix:some-module.

log.error(Error('woops')); //logs to stderr with key wnp:some-module or wix:some-module.
```

# Api
## get(): DebugLogger
Returns logger instance, where key will be:
 - if module prefix is wix-*, then key will be wix:*, ex. wix-module -> wix:module;
 - if module prefix is wnp-*, then key will be wnp:*, ex. wnp-module -> wnp:module;
 - will prefix with wix: in other case, ex. my-module -> wix:my-module;

## WixLogger.info(arguments)
Logs message to stdout;

## WixLogger.error(arguments)
Logs message to stderr.