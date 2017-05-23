# wix-bi-aspect

Aspect containing bi-specific properties.

## install

```bash
npm install --save wix-bi-aspect
```

## usage

Intended to use within request scope via framework adapter, ex. [wix-express-aspects](../wix-express-aspects).

## Api
### builder(): requestData => new WixBiAspect(requestData)
Returns an function that, providing `requestData`(as defined by [Aspect](../wix-aspects)) returns a new instance of `WixBiAspect`.

### WixBiAspect#generateClientId => string
Generates, stores and returns a random UUID for clientId but only if there wasn't one.

### WixBiAspect#generateGlobalSessionId => string
Generates, stores and returns a random UUID for globalSessionId but only if there wasn't one.

### WixBiAspect extends [Aspect](../wix-aspects)
Exposed properties:
 - name - name of aspect, 'bi';
 - globalSessionId;
 - userId;
 - clientId;
 - userType;
 - visitorId;
