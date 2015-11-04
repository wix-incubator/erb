# wix-express-session

http://expressjs.com/ middleware that populates [wix-session](../wix-session).

## install

```js
npm install --save wix-express-session
```

## usage

```js
const express = require('express'),
  wixExpressDomain = require('wix-express-domain');
  wixExpressSession = require('wix-express-session'),
  wixSession = require('wix-session');

const app = express();
app.use(wixExpressDomain);
app.use(wixExpressSession);

app.get('/', (req, res) => {
    res.send(wixSession.get().userGuid);
});

app.listen(3000);

```
## Api
### get(mainKey, alternateKey)
Returns middleware function bound to provided session decryption keys.