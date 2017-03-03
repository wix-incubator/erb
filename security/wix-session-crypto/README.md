# wix-session-crypto

Decrypts wix-session and validates its expiration!

## install

```bash
npm install --save wix-session-crypto
```

## usage

```js
const WixSessionCrypto = require('wix-session-crypto');

// get decrypted session
const session = new WixSessionCrypto('mainKey').decrypt('sessionString');

// get the user Guid from decrypted session
session.userGuid
```

## Api

## devKey: object
Returns a String containing key bound to dev environment.

## privateKey: object
Returns a String containing encryption key used to encrypt 'wixSession2'-based session.

### WixSessionCrypto(key): WixSessionCrypto
Returns instance of `WixSessionCrypto` that will encrypt/decrypt session using provided keys:
 - key - decryption key;

### WixSessionCrypto.decrypt(token)
Decrypts provided session token and returns data encoded within:
- userGuid
- userName
- expiration
- userCreationDate
- wixStaff
— remembered

## errors.SessionExpiredError
Emitted for an expired session.

## errors.SessionMalformedError
Emitted for a malformed session.