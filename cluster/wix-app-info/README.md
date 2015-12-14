# wix-app-info

An app-info app that is intended to be served from (wix-management-app)[../wix-management-app]. It provides basic app info (general info, environment, configs) and can be extended with custom pages/views.

## install

```js
npm install --save wix-management-app
```

## usage

```js
const express = require('express'); 
  app = require('wix-app-info');

express().use('/app-info', app()).listen(3000);
```

## custom views

'wix-app-info' can be extended with custom views which displays data in one of supported forms:
 - single table with 2 columns (template name: 'single-column');
 - 2 tables with 2 columns each rendered side-by-side  (template name: 'two-columns').

Example of an app with custom view:
 
```js
'use strict';
const express = require('express'),
  appInfo = require('../..');

class CustomView extends appInfo.views.AppInfoView {  
  get data() {
    return Promise.resolve({items: [appInfo.views.item('anItemName', 'anItemValue')]});
  }
}

const customView = new CustomView({mountPath: '/custom', title: 'Custom', template: 'single-column'});

express().use('/app-info', appInfo([customView])).listen(3000);
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

### (customViews)
Returns an express app which can be plugged in to another router/express app.

Parameters:
 - customViews - optional, array of class instances that extend `views.AppInfoView` and implement getter `data()` which returns promise with data in a format bound to a template to be used.

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

Example:

```js
{
  mountPath: '/custom',
  title: 'Custom',
  template: 'single-column'
}
```