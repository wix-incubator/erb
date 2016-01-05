# env-support

Provides/generates objects in a form of environment variables that are usually passed to child_process spawn/fork and match wix infra contract.

Generated object has properties:
 - PORT: integer, random between 3000 and 4000;
 - MOUNT_POINT: const, '/app';
 - APP_NAME: const, 'app'; 
 - MANAGEMENT_PORT: integer, random between 3000 and 4000, different than PORT;

Example:

```js
{
  PORT: 3002,
  MOUNT_POINT: '/app',
  APP_NAME: 'app',
  MANAGEMENT_PORT: 3006
}
```

## install

```js
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