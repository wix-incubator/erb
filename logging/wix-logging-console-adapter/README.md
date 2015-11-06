# wix-logging-console-adapter

Module adapts built-in 'console' logging functions to route messages to wix infrastructure instead of stdout/stderr.

## install

```js
npm install --save wix-logging-console-adapter
```

## usage

**note** this example presumes that other wiring is done like describe in [logging](../).

At entry point of your app:

```js
require('wix-logging-console-adapter').setup();

console.log('should land in stdout');
```

given you are in development mode, stdout/stderr is used with simplified logging format, otherwise logging events end-up in destination (ex. log file) based on service configuration.

## notes

 - category is set to 'console';
 - console.log has level of 'info';
