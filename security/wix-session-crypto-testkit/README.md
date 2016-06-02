# wix-session-crypto-testkit

Provides convenience functions/objects for working with both:
 - old wix session (cookie name `wixSession`);
 - new wix session (cookie name `wixSession2`).

## install

```js
npm install --save-dev wix-session-crypto-testkit
```

## usage

Simple case:

```js
const wixSessionCryptoTestkit = require('wix-session-crypto-testkit').v2;

const bundle = wixSessionCryptoTestkit.aValidBundle();
```

With overrides:

```js
const wixSessionCryptoTestkit = require('wix-session-crypto-testkit').v1;

const bundle = wixSessionCryptoTestkit.aValidBundle({
  mainKey: '1234211331224111',
  session: {
    userGuid: 'overriden_guid'
  }
});
```

## Api

### v1

### aValidBundle(opts)
Returns generated object bound to keys exported by [wix-session-crypto](../wix-session-crypto).devKeys containing:
 - mainKey - crypto key;
 - session - session object as contained within encrypted session token and prodyced by [wix-session-crypto](../wix-session-crypto);
 - sessionJson - stringified and then parsed `session`. 
 - token - wix session token - otherwise encrypted 'session' object from this bundle;
 - cookieName - name of wix session cookie.
 
Parameters:
 - opts: optional object containing:
  - mainKey: encryption key (16 chars) used to encrypt/decrypt session cookie.
  
### anExpiredBundle(opts)
Returns generated object in a same format as `aValidBundle(opts)`, but session within is expired.

### v2

### aValidBundle(opts)
Returns generated object bound to keys exported by [wix-session-crypto](../wix-session-crypto).devKeys containing:
 - publicKey - key that can be used to decrypt `token`;
 - privateKey - key used to encrypt `token`.
 - session - session object as contained within encrypted session token and prodyced by [wix-session-crypto](../wix-session-crypto);
 - sessionJson - stringified and then parsed `session`. 
 - token - wix session token - otherwise encrypted 'session' object from this bundle;
 - cookieName - name of wix session cookie.
 
Parameters:
 - opts: optional object containing:
  - mainKey: encryption key (16 chars) used to encrypt/decrypt session cookie.
  
### anExpiredBundle(opts)
Returns generated object in a same format as `aValidBundle(opts)`, but session within is expired.
  