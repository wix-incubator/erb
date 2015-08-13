# wix-config module

This module loads .erb-based config file and environment variables required for basic app operations.

## config file

Depends on two environment variables for config file loading:
 - APP_CONF_DIR - location of config file or defaults to '/configs';
 - APP_NAME - name of app in a form of '{groupId}.{artifactId}', where only artifactId part is extracted.

Example:
 - APP_CONF_DIR is '/conf' and APP_NAME is 'com.wixpress.example-app';
 - resolved location is '/conf/example-app-config.json'.

## environment

Loads environment variables and merges into resulting configuration object under 'env'.

Mandatory environment variables + mappings to produced object:
 - APP_NAME - env.appName;
 - MOUNT_POINT - env.mountPoint;
 - PORT - env.appName;
 - MANAGEMENT_PORT - env.managementPort;

Result config is:
```js
{
 //your .erb content
"env": {
  appName: "com.wixpress.app-name",
  port: 8080,
  managementPort: 8084,
  mountPoint: "/app-mount"
 }
}
```

## merge/override

Values from .erb configuration file under key 'env' have precendence over environment variables.
 
Say you have .erb:
```js
{
 "env": {
  "port": 1000
 }
}
```

and environment variable PORT is set to 8080, produced config will be:
```js
{
 "env": {
  "port": 8080
 }
}
```

#Install

```bash
$ npm install --save wix-config
```

#Usage

## es5

```js
var config = require('wix-config').get();

var valueFromConfig = config.myConfigKey;
var envValue = config.env.port;
```

## es6

```js
import * as wixConfig from 'wix-config';

var config = wixConfig.get();

var valueFromConfig = config.myConfigKey;
var envValue = config.env.port;
```