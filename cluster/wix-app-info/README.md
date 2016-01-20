# wix-app-info

An app-info app that is intended to be served from (wix-management-app)[../wix-management-app]. It provides basic app info (general info, environment, configs) and can be extended with custom pages/views.

Each view can return data in two formats:
 - json - given 'application/json' Accept header is present;
 - html - otherwise.

## install

```js
npm install --save wix-app-info
```

## usage

```js
const express = require('express'); 
  app = require('wix-app-info');

express().use('/app-info', app({
  appName: 'appName',
  appVersion: 'appVersion'
})).listen(3000);
```

## custom views

'wix-app-info' can be extended with custom views which displays data in one of supported forms:
 - single table with 2 bibuicolumns (template name: 'single-column');
 - 2 tables with 2 columns each rendered side-by-side  (template name: 'two-columns').

and serve same data as json.

Example of an app with custom view:
 
```js
'use strict';
const express = require('express'),
  appInfo = require('../..');

class CustomView extends appInfo.views.AppInfoView {
  
  api() {
    return Promise.resolve({anItemName: 'anItemValue'});
  }
  
  view() {
    return Promise.resolve({items: [appInfo.views.item('anItemName', 'anItemValue')]});
  }
}

const customView = () => new CustomView({mountPath: '/custom', title: 'Custom', template: 'single-column'});

express().use('/app-info', appInfo({views: [customView]})).listen(3000);
```

### template 'single-column'

Renders data in a single table with 2 columns and accepts data in following format (returned as promise with data from 'data()'):

```
{
  items: [
    {key: 'key1', value: 'value1'},
    {key: 'key2', value: 'value2'}
  ]
}
```

### template 'two-columns'

Renders data in a two tables with 2 columns each and accepts data in following format (returned as promise with data from 'data()'):

```
{
  left: [
    {key: 'key1', value: 'value1'},
    {key: 'key2', value: 'value2'}
  ],
  right: [
    {key: 'key1', value: 'value1'},
    {key: 'key2', value: 'value2'}
  ]
}
```

## Api

### (opts)
Returns an express app which can be plugged in to another router/express app.

Parameters:
 - appName - optional, name to display in '/about' view;
 - appVersion - optional, version to display in '/about' view and servie on '/app-data';
 - views - optional, array of functions that accept single param (`appDir`) and returns class instances that extend `views.AppInfoView` and implement getter `data()` which returns promise with data in a format bound to a template to be used.

### views.item(key, value)
Helper returning object in a form of:

```js
{
  key: 'key',
  value: 'value'  
}
```

That can be used for populating one of default views.

### views.AppInfoView(opts)
Base class to be used for creating custom views.

Parameters:
 - opts: object, mandatory - provides view configuration with entries:
  - mountPath - on what path view should be mounted;
  - title - title of a view in navigation menu;
  - template - template to be used for rendering view.

Given you want to provide custom view, your job is to implement two functions: 
 - api() - returns a json object via Promise and results are served on 'opts.mountPath' given proper accept header will be provided;
 - view() - returns a view-ready json object via Promise and results are served on 'opts.mountPath' with tabs available in html view.

Example:

```js
{
  mountPath: '/custom',
  title: 'Custom',
  template: 'single-column'
}
```