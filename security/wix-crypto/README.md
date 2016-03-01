# wix-crypto

Encrypts/decrypts data.

## Install

```bash
npm install --save wix-crypto
```

## Usage

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
    - mainKey: mainKeyString (mandatory) - key, used to encrypt `data`
    - algorithm: encryptionAlgorithm (optional, default: `AES_128_ECB`) - algorithm, used to encrypt `data`
    - clearEncoding: string (optional, one of `utf8`, `ascii`, `binary`; default: `utf8`) - encoding of provided `data`
    - cipherEncoding: string (optional, one of `binary`, `base64`, `hex`; default: `hex`) - encoding of returned string

### decrypt(data, options)
Returns decrypted data as string or throws exception if decryption fails. Params:
  - data - string to decrypt;
  - options - object:
    - mainKey: mainKeyString (mandatory) - key, used to decrypt `data`
    - alternateKey: alternateKeyString (optional. default: undefined) - alternate key, used to decrypt `data` in case of
      mainKey fails
    - algorithm: decryptionAlgorithm (optional. default: `AES_128_ECB`) - algorithm, used to decrypt `data`
    - clearEncoding: string (optional, one of `utf8`, `ascii`, `binary`; default: `utf8`) - encoding of returned string
    - cipherEncoding: string (optional, one of `binary`, `base64`, `hex`; default: `hex`) - encoding of provided `data`

### AES_128_ECB - const, representing aes 128 ecb algorithm
