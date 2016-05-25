# bootstrap to bootstra-ng migration guide

## index.js

 - remove `wix-bootstrap` from package.json;
 - `npm install --save wix-bootstrap-ng`;

**Index before:**
```js
'use strict';
require('wix-bootstrap')
  .express('./lib/app')
  .start();
```

**index after:**
```js
 'use strict';
const bootstrap = require('wix-bootstrap');

bootstrap()
  .express('./lib/app')
  .start();
```

## rpc

rpc is no longer available out of the box - you need to `npm install` it and `use` on bootstrap:

```sh
npm install --save wix-bootstrap-rpc
```

```js
 'use strict';
const bootstrap = require('wix-bootstrap');

bootstrap()
  .use(require('wix-bootstrap-rpc'))
  .express('./lib/app')
  .start();
```

you can access rpc via `context` - see [wix-bootstrap-rpc](../wix-bootstrap-rpc).

## express

Now function exporting your express app does not receive `express` app as parameter, you have to create and return it. 

**before:**
```js
'use strict';
module.exports = app => {
  app.get('/hello', (req, res) => res.send('hi'));
};
```

**after:**
```js
'use strict';
const express = require('express');
module.exports = context => {
  const app = new express.Router();
  app.get('/hello', (req, res) => res.send('hi'));
  return app;
};
```

## config

Use config available within context instead of global module.

