# wnp-bootstrap-management

Management app container, plugged-in by default to [wix-bootstrap-ng](../../bootstrap-ng/wix-bootstrap-ng) and serves '/app-info'([wix-app-info](../../cluster/wix-app-info)) as well as provided express apps/routers.

## install

```bash
npm install --save wnp-bootstrap-management
```

## usage

Given you are developing custom app using [wnp-bootstrap-composer](../wnp-bootstrap-composer), you can plug-in this app as `options.composers.managementExpress` via constructor:

```js
const managementComposer = require('wnp-bootstrap-management'),
  Composer = require('wnp-bootstrap-composer');
  
const instance = new Composer({composers: {managementExpress: managementComposer}});
```

## api
### (context, apps): express app
Given initial context from [wnp-bootstrap-composer](../wnp-bootstrap-composer) and a list of express apps it will return you a composed express app.