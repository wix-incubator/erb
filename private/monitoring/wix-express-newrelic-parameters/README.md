# wix-express-newrelic-parameters

Express.js middleware to report incoming HTTP request headers to newrelic via [addCustomParameters](https://github.com/newrelic/node-newrelic#newrelicaddcustomparametersparams) API.

## install

```bash
npm install --save wix-express-newrelic-parameters
```

## usage
Make sure you have newrelic agent [properly installed and configured](https://docs.newrelic.com/docs/agents/nodejs-agent/installation-configuration/install-nodejs-agent).
                                                           
```javascript
const express = require('express'),
  newrelic = require('newrelic'),
  newrelicExpressMiddleware = require('wix-express-newrelic-parameters');

const app = express();

app.use(newrelicExpressMiddleware(newrelic));

// your app & routes here

app.listen(3000);
```                            

                               