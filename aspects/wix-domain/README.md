# wix-domain

Convenience module to store/retrieve request-scoped wix-specific data. 

It's not intended to be used by app developers, where app developers should access data by domain/concern-specific module, ex [wix-req-context](../wix-req-context).

## install

```js
npm install --save wix-domain
```

## usage

```js
const wixDomain = require('wix-domain');

let current = wixDomain.get();
```

For complete example see [wix-express-domain](../wix-express-domain).

## note

wix-domain builds on [node domain](https://nodejs.org/api/domain.html) which is deprecated, but until node devs will come-up with better approach - we use it.