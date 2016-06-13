# wix-config

Loads a file-based json config from path provided via `setup()` or fallback env variable 'APP_CONF_DIR'.

## install

```js
npm install --save wix-config
```

## usage

Given you have a config 'app-name.json' in folder '/configs/'

```js
const wixConfig = require('wix-config');
wixConfig.setup('/configs');

const config = wixConfig.json('app-name');
```

Given you have a config 'app-name.txt' in folder '/configs/'

```js
const wixConfig = require('wix-config');
wixConfig.setup('/configs');

const config = wixConfig.json('app-name.txt');
```

## Api
### setup(confDir)
Set config folder to be used for loading configs.

Arguments:
 - confDir: valid folder to load configs from.

### json(name)
Loads config from `${confDir}/{name}.json`

### text(name)
Loads config from `${confDir}/{name}`