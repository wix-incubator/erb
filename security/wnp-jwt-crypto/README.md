# wnp-jwt-crypto

Encrypts/decrypts data using jwt.

## Install

```bash
npm install --save wnp-jwt-crypto
```

## Usage

```js
const jwtCrypto = require('wnp-jwt-crypto')

const encrypted = jwtCrypto.encrypt('dataString', {privateKey: '...'});
const data = jwtCrypto.decrypt(encrypted, {publicKey: 'pubKey'});
// data == 'dataString'
```

## Api

### encrypt(data, options)
Returns encrypted data as string. Params:
 - data - string to encrypt;
 - options - object, mandatory:
    - privateKey: mandatory, - key, used to encrypt `data`, must be in PEM string format (`-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----`);

### decrypt(data, options)
Returns decrypted data as string or throws exception if decryption fails. Params:
  - data - string to decrypt;
  - options - object, mandatory:
    - publicKey: mandatory, - key, used to encrypt `data`. , must be in PEM string format (`-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----`);
    - ignoreExpiration: boolean, optional - should expiration be validated. Defaults to 'false'.
        
### decode(data)
Decodes `data` without any signature validation/decryption