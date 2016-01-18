# wix-session

Immutable object containing wix session extracted from request. Actual extraction is done by companion module [wix-express-session](../wix-express-session).

## install

```js
npm install --save wix-session
```

## usage

Within request:

```js
const wixSession = require('wix-session');
const userGuid = wixSession.get().userGuid;
```

For complete example see [wix-express-session](../wix-express-session).

## Api

### set(session)
Sets session object, can be done only once during lifecycle of request.

### get()
Returns wix session object extracted from request (or null if request did not contain wix session cookie). For object properties see [wix-session-crypto](../../security/wix-session-crypto).
