# wix-hmac-signer

Returns HMAC-SHA1 hex signature for given data. 

## install

```js 
npm install --save wix-hmac-signer
```

## usage

```js
const key = '1234567890123456';
const signer = require('wix-hmac-signer').get(key);

// sign string
let signature = signer.sign('some-string');

// sign array of strings
let signature = signer.sign(['some-string', 'some-other-string']);

// sign Buffer
let signature = signer.sign(Buffer('to-buff'));
    
// sign of array of strings
let signature = signer.sign([Buffer('to-buff'), Buffer('to-buff')]);
```

## Api

### get(key)
Returns `HmacSigner` instance for given `key`;

### HmacSigner.sign(data)
Returns signature for given data, where data can be one of:
 - String;
 - Buffer;
 - array of strings;
 - Array of buffers.