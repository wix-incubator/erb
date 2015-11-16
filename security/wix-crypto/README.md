# wix-crypto

Encrypts/decrypts data.

## install

```js
npm install --save wix-crypto
```

## usage

```js
const wixCrypto = require('wix-crypto')

// get wixSession object
const encrypted = wixCrypto.encrypt('dataString', {mainKey: 'encryptionKey'});
const data = wixCrypto.decrypt(encrypted, {mainKey: 'encryptionKey'});
// data == 'dataString'
```

## Api

### encrypt(data, options)
Returns encrypted data as string. Params:
 - data - string to encrypt;
 - options - object:
 {
    mainKey: mainKeyString (mandatory) - key, used to encrypt data
    algorithm: encryptionAlgorithm (optional. default: AES_128_ECB) - algorithm, used to encrypt data
 }

### decrypt(data, options)
Returns decrypted data as string or throws exception if decryption fails. Params:
  - data - string to decrypt;
  - options - object:
  {
    mainKey: mainKeyString (mandatory) - key, used to decrypt data
    alternateKey: alternateKeyString (optional. default: undefined) - alternate key, used to decrypt data in case of
        mainKey fails
    algorithm: decryptionAlgorithm (optional. default: AES_128_ECB) - algorithm, used to decrypt data
  }

### AES_128_ECB - const, representing aes 128 ecb algorithm
