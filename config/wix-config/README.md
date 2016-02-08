# wix-config

Loads a file-based json config from path provided via `setup()`.

## install

```js
npm install --save wix-config
```

## usage

Given you have a config 'app-name.json' in folder '/configs/'

```js
const wixConfig = require('wix-config');
wixConfig.setup('/configs');

const config = wixConfig.load('app-name');
```

## Api
### setup(confDir)
Set config folder to be used for loading configs.

Arguments:
 - confDir: valid folder to load configs from.

### load(name)
Loads config from `${confDir}/{name}.json`