# env-support

Provides/generates objects in a form of environment variables that are usually passed to child_process spawn/fork and match wix infra contract.

Generated object has properties:
 - PORT: `BOOTSTRAP` as defined in `wix-test-ports` module;
 - MANAGEMENT_PORT: `BOOTSTRAP_MANAGEMENT` as defined in `wix-test-ports` module;
 - MOUNT_POINT: const, '/app';
 - APP_NAME: const, 'app'.

Example:

```js
{
  PORT: 3000,
  MOUNT_POINT: '/app',
  APP_NAME: 'app',
  MANAGEMENT_PORT: 3004
}
```

## install

```bash
npm install --save env-support
```

## usage

Basic usage to generate environment object:

```js
const envSupport = require('env-support');

const env = envSupport.basic();
```

With overridden mount point:

```js
const envSupport = require('env-support');

const env = envSupport.basic({MOUNT_POINT: '/my-custom'}); //overrides MOUNT_POINT
```

## Api

### basic(obj)
Generates new environment object with random ports.

Parameters:
 - obj: object, optional - if provided, will merge-in/override properties of generated object.
 
### bootstrap(obj)
Intended to be used for bootstrap-based apps - additionally configures new-relic, etc.

Parameters:
 - obj: object, optional - if provided, will merge-in/override properties of generated object. 