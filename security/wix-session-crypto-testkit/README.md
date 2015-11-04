# wix-session-crypto-testkit

Provides convenience functions/objects for working with wix session

## install

```js
npm install --save-dev wix-session-crypto-testkit
```

## usage

```js
const wixSessionCryptoTestkit = require('wix-session-crypto-testkit');

const bundle = wixSessionCryptoTestkit.aValidBundle();
```

## Api

### aValidBundle()
Returns generated object containing:
 - mainKey - main crypto key;
 - session - session object as contained within encrypted session token and prodyced by [wix-session-crypto](../wix-session-crypto);
 - sessionJson - jsonified session object - javascript objects stringified, ex. dates;
 - token - wix session token - otherwise encrypted 'session' object from this bundle;
 - cookieName - name of wix session cookie.