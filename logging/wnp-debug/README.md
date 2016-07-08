# wnp-debug

Simple wrapper on top of [debug](https://www.npmjs.com/package/debug) with features:
 - normalizes log key to be of `wix:` or `wnp:` format;
 - provides info/error/debug functions with corresponding infix;
 - coerces error objects within log arguments.

**Note:** this is a platform-private module, so it can break at any time.

## install

```js 
npm install --save wnp-debug
```

## usage

```js
const log = require('wnp-debug')('some-module')

log.info('info msg'); //logs to stdout with key wnp:some-module.

log.error(Error('woops')); //logs to stderr with key wnp:error:some-module.
```

# Api
## (name): DebugLogger
Returns logger instance, where key will be:
 - `name` prefixes `wix-` and `wnp-` will be replaced with `wix:` or `wnp:`;
 - `name` prefixes `wix:` and `wnp:` will be left intact;
 - otherwise `name` will be prefixed with `wnp:`;

Examples: 
 - debug('name').info('woop') -> 'wnp:info:name woop';
 - debug('wix-name').debug('woop') -> 'wix:info:name woop';
 - debug('wix:name').info('woop') -> 'wix:info:name woop'; 

## WixLogger.debug(arguments)
Logs message to stderr with 'debug' infix.

## WixLogger.info(arguments)
Logs message to stderr with 'info' infix.

## WixLogger.error(arguments)
Logs message to stderr with 'error' infix.