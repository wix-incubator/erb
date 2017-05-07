# wix-gatekeeper-aspect

Aspect containing gatekeeper authorization context

## install

```bash
npm install --save wix-gatekeeper-aspect
```

## usage

Intended to use within request scope via framework adapter, ex. [wix-express-aspects](../wix-express-aspects).

## Api
### builder(): requestData => new WixGatekeeperAspect(requestData)
Returns a function that, providing `requestData`(as defined by [Aspect](../wix-aspects)) returns a new instance of `WixGatekeeperAspect`.

### WixGatekeeperAspect extends [Aspect](../wix-aspects)
Exposed properties:
 - `name: String` - name of aspect, 'gatekeeper';
 - `authorized: Boolean` - a flag indicating whether gatekeeper authorization had happened during the request lifecycle
 - `context: {loggedInUser: String, ownerId: String, roles: [String]}` - authorization context or `undefined`
 
 ### WixGatekeeperAspect#authorize(context)
 Mutates this aspect instance - updates the context
 
 *called by [wix-gatekeeper-client](../../gatekeeper/wix-gatekeeper-client)*
