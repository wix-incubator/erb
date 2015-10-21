# wix-logging-debug-adapter

Module adapts [debug](https://www.npmjs.com/package/debug) logger to route messages to wix infrastructure instead of stderr.

# installation

```js
npm install --save wix-logging-debug-adapter
```

# usage

At entry point of your app:

```js
process.env.DEBUG = 'category';

const debug = require('debug');

require('wix-logging-debug-adapter').setup(debug);

debug('category')('should land in stderr');
```

given you are in development mode, stdout/stderr is used with simplified logging format, otherwise ends-up in log file based on service configuration.

# notes

 - level is set to 'debug';
 - adapter disables coloring, as it interferes with wix logger infrastructure;
 - explicit binds to stdout/stderr will not work;
 - logging messages in development mode will be written to stdout instead of default stderr;
 - messages to be forwarded/written are controlled via DEBUG environment variable or 'debug.enable()', 'debug.disable()' functions.
 
# caveats

'debug' library does not provide proper way to extract error and pass as an object down the line, so if you do debug('cat')(new Error('woops')), it get's encoded into message with stacktrace. This is ok by itself, but structured logs might look differently than with other adapters where log message and stacktrace are separated properly.  