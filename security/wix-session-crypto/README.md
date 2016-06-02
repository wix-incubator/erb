# wix-session-crypto

Decrypts wix-session.

**Note: module does not validate session expiration - it is responsibility of a caller to validate expiration!**

## install

```js
npm install --save wix-session-crypto
```

## usage

```js
const wixSessionCrypto = require('wix-session-crypto').v2.get('mainKey');

// get wixSession object
const session = wixSession.decrypt('sessionString');

// get the user Guid
session.userGuid
```

## Api

There are 2 apis (v1 and v2) for decrypting 'wixSession' and 'wixSession2' session cookies. Api is identical, just keys and tokens differ.

## v1|2.devKey: object
Returns a String containing key bound to dev environment.

### v1|2.get(key): WixSessionCrypto
Returns instance of `WixSessionCrypto` that will encrypt/decrypt session using provided keys. Params:
 - key - decryption key;

### WixSessionCrypto.decrypt(token)
Decrypts provided session token and returns data encoded within:
- userGuid
- userName
- colors
- expiration
- userCreationDate
- wixStaff
— remembered