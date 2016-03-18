# wix-req-options

Helper to create http request headers, pluggable to [request](https://www.npmjs.com/package/request) or [node-fetch](https://www.npmjs.com/package/node-fetch) just like in wix.

## install

```bash
npm install --save wix-req-options
```

## usage

```js
const reqOptions = require('wix-req-options').builder,
  fetch = require('node-fetch');

const opts = reqOptions.builder()
  .withSession()
  .withPetriAnonymous(1, 1)
  .withPetriAnonymous(2, 1)
  .options();
  
  fetch('http://localhost:3000', opts).then(res => ...);
```

## Api

### builder(): WixHeadersBuilder
Returns an instance of `WixHeadersBuilder` that can be used to build headers/cookies and that contains generic headers by default:

Defaults:
 - 'x-wix-request-id' - random guid;
 - 'x-wix-default_port' - '2222';
 - 'x-wix-ip' - '1.1.1.1';
 - 'x-wix-url' - 'http://www.kfir.com';
 - 'x-wix-language' - 'pt';
 - 'x-wix-country-code' - 'BR';

### WixHeadersBuilder.withBi()
Adds bi-secific cookies with random values:
 - '_wixUIDX' - random guid;
 - '_wixCIDX' - random guid;
 - '_wix_browser_sess' - random guid;
 - 'userType' - random guid.

### WixHeadersBuilder.withPetriAnonymous([specId], [specValue])
Adds a '_wixAB3' cookie with either defaults or value composed of `specId` and `specValue`.

Can be called multiple times - appends experiment values.

### WixHeadersBuilder.withPetri([userId], [specId], [specValue])
Adds a user-bound '_wixAB3' cookie with either defaults or value composed of `userId`, `specId` and `specValue`.

Parameters:
 - none - injects defaults;
 - userId = creates cookie for user with defaults for `specId` and `specValue`;
 - userId, specId, specValue = creates cookie for user with provided `specId` and `specValue`;

Can be called multiple times - appends experiment values for same user or adds new cookies for other users.

### WixHeadersBuilder.withSession([opts])
Adds a session cookie using options that are passed-in to [wix-session-crypto-testkit](../../security/wix-session-crypto-testkit) `aValidBundle()`.

Parameters:
 - none - calls `aValidBundle()` with no options;
 - object - calls `aValidBundle()` with provided options;
 
### WixHeadersBuilder.raw()
Returns raw headers/cookies in a form of `{headers: {}, cookies: {}}`;

### WixHeadersBuilder.options()
Returns headers and cookies encoded to a 'cookie' headers in a form of `{headers: {}}`.