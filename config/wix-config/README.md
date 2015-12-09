# wix-config

Loads a file-based config from path defined by environment variable APP_CONF_DIR. Caches loaded config, so subsequent calls will not do fs access.

## install

```js
npm install --save wix-config
```

## usage

```js
const config = require('wix-config').get('app-name');
```

## Api
### get(name)
Loads config from `${process.env.APP_CONF_DIR}/{name}.json`