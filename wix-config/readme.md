# wix-config module

This module loads .erb-based config file and environment variables required for basic app operations.

 - config.app gives you object representing your .erb config file;
 - config.env gives you environment-based config in a form of

```js
 {
  appName: "com.wixpress.app-name",
  port: "8080",
  managementPort: "8084",
  mountPoint: "/app-mount"
 }
```

It caches loaded configuration, so no additional IO is done on subsequent calls.

# Configuration

Depends on two environment variables for config file loading:
 - APP_CONF_DIR - location of config file or defaults to '/configs';
 - APP_NAME - name of app in a form of '{groupId}.{artifactId}', where only artifactId part is extracted.

Example:
 - APP_CONF_DIR is '/conf' and APP_NAME is 'com.wixpress.example-app';
 - resolved location is '/conf/example-app-config.json'.

#Install

```bash
$ npm install --save wix-config
```

#Usage

## es5

```js
var config = require('wix-config').get();

var valueFromConfig = config.app.myConfigKey;
var envValue = config.env.port;
```

## es6

```js
import * as wixConfig from 'wix-config';

var config = wixConfig.get();

var valueFromConfig = config.app.myConfigKey;
var envValue = config.env.port;
```