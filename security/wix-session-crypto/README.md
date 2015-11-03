# wix-session-crypto

Encrypts/decrypts wix-session.

## install

```js
npm install --save wix-session-crypto
```

## usage

```js
const wixSessionCrypto = require('wix-session-crypto').get('mainKey', 'alternateKey');

// get wixSession object
const session = wixSession.decrypt('sessionString');

// get the user Guid
session.userGuid

// convert session to token
const sessionString = wixSession.encrypt(session);
```

## Api

### get(mainKey, alternateKey)
Returns instance of `WixSessionCrypto` that will encrypt/decrypt session using provided keys. Params:
 - mainKey - main crypto key;
 - alternateKey - optional, serves as a backup for decrypt.

### WixSessionCrypto.decrypt(token)
Decrypts provided session token and returns data encoded within:
- uid
- userGuid
- userName
- email
- mailStatus
- isWixStaff
- permissions
- userCreationDate
- version
- userAgent
— isRemembered
- expiration
- colors

### WixSessionCrypto.encrypt(session)
Encrypts provided session object and returns a session string.