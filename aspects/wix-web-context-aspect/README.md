# wix-web-context-aspect

Aspect containing web-context-specific properties.

## install

```bash
npm install --save wix-web-context-aspect
```

## usage

Intended to use within request scope via framework adapter, ex. [wix-express-aspects](../wix-express-aspects).

## Api
### builder(seenByHeaderValue): requestData => new WixWebContextAspect(data, seenByHeaderValue)
Returns an function that, providing `requestData`(as defined by [Aspect](../wix-aspects)) returns a new instance of `WixWebContextAspect` and which will inject 'x-seen-by' header with provided value. 

### WixWebContextAspect
Exposed properties:
 - name - name of aspect, 'web-context';
 - requestId;
 - url;
 - userAgent;
 - localUrl;
 - userPort;
 - userIp;
 - cookieDomain;
 - language;
 - geo - object with properties:
  - 2lettersCountryCode;
  - 3lettersCountryCode;
 - seenBy;

### WixWebContextAspect.import(data)
Imports 'x-seen-by' header and appends to existing list;

### WixWebContextAspect.export()
Returns object with 'x-seen-by' header produced from 'seenBy' property.