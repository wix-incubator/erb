# wix-config

Loads a file-based config from path defined by environment variable APP_CONF_DIR.

## install

```js
npm install --save wix-config
```

## usage

```js
const config = require('wix-config').load('app-name');
```

## Api
### load(name)
Loads config from `${process.env.APP_CONF_DIR}/{name}.json`