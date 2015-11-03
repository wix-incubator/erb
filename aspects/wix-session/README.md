# wix-session

Immutable object containing wix session decrypted/extracted from cookie. Actual extraction is done by companion module per web framework, ex. for http://expressjs.com/ - [wix-express-req-context](../wix-express-session).

## install

```js
npm install --save wix-session
```

## usage

```js
const express = require('express'),
  wixExpressSession = require('wix-express-session'),
  wixSession = require('wix-session');

const app = express();
app.use(wixExpressSession);

app.get('/', (req, res) => {
    res.send(JSON.stringify(wixSession.get()));
});

...
```

## Api

### set(session)

Sets session object, can be done only once during lifecycle of request.

### get()

Returns an object that represents stored wix session or `undefined` is request does not contain session cookie.

Available session properties can be found at [wix-session-crypto](../../security/wix-session-crypto). 