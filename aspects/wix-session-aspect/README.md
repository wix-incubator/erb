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