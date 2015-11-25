# wix-bootstrap-cluster

Bootstrap application launcher that launches client application in a clustered environment - n child processes, where n > 0;

`wix-bootstrap-cluster` is a singleton, so you can set-up/use/invoke it once per app and only last call to `setup()` is effective.

# Install

```
npm install --save wix-bootstrap-cluster
```

# Configuration

`wix-bootstrap-cluster` is configured via `setup()` which is optional if:
 - you have environment variable `APP_CONF_DIR` pointing to where configuration file `wix-bootstrap-cluster.json` is located.
 
In other case you can configure cluster programatically via `setup()` - if you provide full cluster configuration, config file `wix-bootstrap-cluster.json` is optional. 

# Usage

There are some considerations when using `wix-bootstrap-cluster`and it's IMPORTANT. You app must contain entry point file that:
 - has no requires/imports outside `wix-bootstrap-cluster.run(fn)` block except for `wix-bootstrap-cluster` itself. Whatever you init/do outside of `wix-bootstrap-cluster.run(fn)` will run both on cluster master and worker processes, so doing something like:
 
```js
process.on('uncaughtException', err => {
  console.log('Caught exception: ' + err);
});
```

will create handler both on cluster master and worker and will potentially interfere with worker process management on cluster and you will not get services like graceful worker shutdown or such. 

Example index.js (given you have environment variable `APP_CONF_DIR` pointing to where configuration file `wix-bootstrap-cluster.json` is located):

```js
'use strict';
require('wix-bootstrap-cluster').run(() => require('./app'));
```

For a complete example please refer to [bootstrap](../).

# Api

## setup(configuration)
Configures global `wix-bootstrap-cluster` instance. This function have 3 main ways to be invoked:
 1. not invoked given you have `APP_CONF_DIR/wix-bootstrap-cluster.json` with full configuration;
 2. `setup()` - with no args is same as #1.
 3. `setup(partial)` - given you have `APP_CONF_DIR/wix-bootstrap-cluster.json`, but want to override some values programatically;
 4. `setup(full)` - given you don't want to use configuration file, but are providing full configuration programatically.
 
`configuration` is an object containing:
 - TBD

## run(bootstrapFn, setups...)

Runs a provided `wix-bootstrap`-compliant function on preconfigured [wix-cluster](../../cluster/wix-cluster).

Arguments:
 - bootstrapFn, mandatory - a function that returns bootstrap function in a form of `function(app) => {return app;}`.
 - setups, optional - 0..n parmeterless setup functions - functions that upon invoking perform set-up of client app. This could be used if you want to separate app set-up from your main logic (api).