# wix-logging-log4js-adapter

Module adapts [log4js](https://www.npmjs.com/package/log4js) logging library to route messages to wix infrastructure.

# install

```js
npm install --save log4js
npm install --save wix-logging-log4js-adapter
```

## usage

**note** this example presumes that other wiring is done like describe in [logging](../).

At entry point of your app:

```js
const log4js = require('log4js');
require('wix-logging-log4js-adapter').setup(log4js);

log4js.getLogger().info('this is %s', 'a message');
```

given you are in development mode, stdout/stderr is used with simplified logging format, otherwise logging events end-up in destination (ex. log file) based on service configuration.

# notes
Log level 'TRACE' is set to 'debug', 'FATAL' to 'error';