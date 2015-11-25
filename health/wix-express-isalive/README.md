# wix-express-isalive

A express middleware module that adds '/health/is_alive' handler as per contract with ops.

## install

```javascript
npm install --save wix-express-isalive
```

## usage

```js
const express = require('express'), 
  expressAlive = require('wix-express-isalive');

const app = express();

expressAlive.addTo(app)

app.listen(3000);
```

## Api

### addTo(app)
Adds '/health/is_alive' GET handler that response with 200 and response body 'Alive'.