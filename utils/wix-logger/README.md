# wix-logger

Logger with simple api to be used by platform modules

## install

```js 
npm install --save wix-logger
```

## usage

```js
const log = require('wix-logger').get('categoryName')

log.info('info msg');

log.error(Error('woops'))
```

# Api

## get(category)
Returns new logger instance with provided `category`.

## Logger.info(arguments)
Log message with info level, `arguments` are formatted with util.format;

## Logger.error(arguments)
Log message with error level, `arguments` are formatted with util.format.

Args are processed differently based on possible combination:
 - (message, error) - if first argument is string and second is error object, other arguments are rejected and message + error are logged;
 - (error) - if first argument is and error, others are rejected and error object is logged;
 - (arguments) - util.format
