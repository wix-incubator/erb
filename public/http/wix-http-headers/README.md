# wix-http-headers

Helper to create http request headers, pluggable to [wix-http-test-client](../wix-http-test-client), [request](https://www.npmjs.com/package/request) or [node-fetch](https://www.npmjs.com/package/node-fetch) just like in wix.

## install

```bash
npm install --save wix-http-headers
```

## usage

```js
const wixHeaders = require('wix-http-headers'),
  http = require('wix-http-test-client');

const headers = wixHeaders()
  .withSession()
  .withHeader('Accept', 'text/html')
  .withPetriOverride('aSpec', 'aValue')
  .headers();

  http.get('http://localhost:3000', {headers}).verify({status: 200});
```

## Api

### () : WixHeaders
Returns an instance of `WixHeaders` builder;

### defaults([opts]) : WixHeaders
Returns an instance of `WixHeaders` builder with defaults (`().wixWixDefaults(opts)`);

### WixHeaders.withWixDefaults([options]): this
Adds common wix headers with possibility to provide custom language and country code:
 - 'x-wix-request-id' - random guid;
 - 'x-wix-default_port' - '2222';
 - 'x-wix-ip' - '1.1.1.1';
 - 'x-wix-url' - 'http://www.kfir.com';
 - 'x-wix-language' - 'en';
 - 'x-wix-country-code' - 'US';

Parameters:
 - object - {'language': 'lt', 'country-code': 'LT'}.

### WixHeaders.withBi(): this
Adds bi-secific cookies with random values:
 - '_wixUIDX' - random guid;
 - '_wixCIDX' - random guid;
 - '_wix_browser_sess' - random guid;
 - 'userType' - random guid.

### WixHeaders.withPetriOverride(specId, specValue): this
Adds a 'petri_ovr' cookie for overriding experiment group.

Parameters:
 - specId, specValue = creates cookie with provided `specId` and `specValue`;

Can be called multiple times - appends experiment overrides.

### WixHeaders.withSession([options]): this
Adds a session cookie using options that are passed-in to [wix-session-crypto-testkit](../../security/wix-session-crypto-testkit) `aValidBundle()`.

Parameters:
 - object - {userGuid: userId, userName: userName, isWixStaff: isWixStaff} - forwards provided options to [wix-session-crypto-testkit](../../security/wix-session-crypto-testkit) `aValidBundle()`.

### WixHeaders.withCookie(name, value): this
Allows to add arbitrary cookie.

### WixHeaders.withHeader(name, value): this
Allows to add arbitrary header.

### WixHeaders.headers()
Returns headers (and cookies encoded to a 'cookie' header) as a JSON object.
