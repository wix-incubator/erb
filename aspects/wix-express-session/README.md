# wix-express-session

ExpressJS middleware, that extracts wix session from session cookie (ex. 'wixSession') and stores it onto 'wix-domain' with and accessor module [wix-session](../wix-session). 

## install

```js
    npm install --save wix-express-session 
```

## usage

Details of the structure of the Wix Session cookie are at the [wix-session](../wix-session) module.

```js
const wixExpressDomain = require('wix-express-domain'),
  wixExpressSession = require('wix-express-session'),
  express = require('express'),
  wixSession = require('wix-session');

const app = express();

//wire in middlewares in a correct order
app.use(wixExpressDomain);
app.use(wixExpressSession.get('mainKey', 'alternateKey'));

app.get('/', (req, res) => {
  //given request contains a wix session cookie, it will be send as response back
  res.json(wixSession.get());
});
```

## Api

### (mainKey, alternateKey)
Returns an express middleware with keys used to decode session cookie.

Parameters:
 - mainKey, string, mandatory - key used to decrypt session cookie;
 - alternateKey, string, optiona - fallback key for decryption.
