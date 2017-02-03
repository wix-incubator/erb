# wix-config

Loads a file-based json/text config from provided path.

## install

```bash
npm install --save wix-config
```

## usage

Given you have a config 'app-name.json' in folder '/configs/'

```js
const WixConfig = require('wix-config');

const configJson = new WixConfig('/configs').json('app-name'); // /configs/app-name.json
const configText = new WixConfig('/configs').json('app-name.txt'); // /configs/app-name.txt
```

## Api
### WixConfig(confDir): WixConfig
Creates new instance of `WixConfig` bound to provided `confDir`.

### json(name)
Loads config from `${confDir}/{name}.json`. Note that `.json` is appended if not provided.

### text(name)
Loads config from `${confDir}/{name}`