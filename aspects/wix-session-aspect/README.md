# wix-session-aspect

Aspect containing wix-session-specific properties.

## install

```bash
npm install --save wix-session-aspect
```

## usage

Intended to use within request scope via framework adapter, ex. [wix-express-aspects](../wix-express-aspects).

## Api
### builder(mainKey, alternateKey): requestData => new WixSessionAspect(requestData)
Returns an function that, providing `requestData`(as defined by [Aspect](../wix-aspects)) returns a new instance of `WixSessionAspect` which uses [wix-session-crypto](../../security-wix-session-crypto) bound to provided keys.

### WixSessionAspect
Exposed properties:
 - name - name of aspect, 'session';

Session properties:
 - userGuid
 - isWixStaff
 - permissions
 - userCreationDate
 - expiration
 - colors
 
Helpers:
 - cookie - object that resembles cookie that was used to create aspect with properties:
  - name - cookie name;
  - value - cookie value (encrypted token).