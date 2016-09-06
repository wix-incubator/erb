# wix-session-aspect

Aspect containing wix-session-specific properties.

## install

```bash
npm install --save wix-session-aspect
```

## usage

Intended to use within request scope via framework adapter, ex. [wix-express-aspects](../wix-express-aspects).

## Api
### builder(v1, v2): requestData => new WixSessionAspect(requestData)
Returns an function that, providing `requestData`(as defined by [Aspect](../wix-aspects)) returns a new instance of `WixSessionAspect` which uses [wix-session-crypto](../../security-wix-session-crypto) to decrypt session cookies.

Parameters:
 - v1: mandatory, crypto function used to decrypt `wixSession` cookie.
 - v2: optional, crypto function used to decrypt `wixSession2` cookie.

### WixSessionAspect
Exposed properties:
 - name - name of aspect, 'session';

Session properties:
 - userGuid
 - userName
 - isWixStaff
 - permissions
 - userCreationDate
 - expiration
 
Helpers:
 - cookies - object that resembles session cookies used to build aspect. Supported cookes: `wixSession`, `wixSession2`. Given `wixSession2` is present, it's data takes precedence over `wixSession`.

example:
```js
{
  'wixSession': 'token...',
  'wixSession2': 'token...'
}
```

###Error handling
At times, session decoding fails, in which case aspect properties (namely, `userGuid`) will not be available.
For a deeper inspection, an `error` property is exposed and can be used as follows:
 
```js
if (aspect.error instanceof sessionAspectModule.errors.SessionExpiredError) {
  // Session data found but has expired
} else if (aspect.error instanceof sessionAspectModule.errors.SessionMalformedError) {
  // Session data found but content is invalid 
} else if (aspect.error) {
  // An unspecified error has occurred
} else {
  // Assuming aspect properties are not available -- no session/cookies data was available
}
```
