# wix-aspects

Commons for aspects - base `Aspect` class, aspect-store builder.

## install

```bash
npm install --save wix-aspects
```

## usage

Given you want to crete a user agent aspect that provides user-agent:

```js
const Aspect = require('wix-aspects').Aspect;

class UserAgentAspect extends Aspect {
  constructor(requestData) {
    super('user-agent', requestData);
    this._aspect = { userAgent: requestData.headers['user-agent'] };
  }
  
  get userAgent() {
    return this._aspect.userAgent;
  }
}

module.exports = requestData => new UserAgentAspect(requestData); 
```

Then you can use this aspect to build a store:

```js
const aspects = require('wix-aspects'),
  userAgentAspect = require('user-agent-aspect');

module.exports = requestData => {
    const store = aspects.buildStore(requestData, [data => userAgentAspect(data)]);
    return store['user-agent-aspect'];
} 
```

## Api

### Aspect(name, requestData)
Base class for all aspects.

#### Aspect.name: String
Returns a name of an aspect

#### Aspect.import(data)
Mutate aspect by providing it `data` in a following format:
 - headers - optional, map of headers;
 - cookies - optional, map of cookies;

This allows to mutate/augment aspect during it's lifetime by importing headers/cookies from intermediate http/rpc calls.

#### Aspect.export(): Object
Export content of aspect.

Response: 
 - object containing:
  - headers: object containing headers, ex. '{key: 'value'}';
  - cookies: array containing cookie object in a format:
   - name: cookie name;
   - value: cookie value;
   - properties: object that conforms to: [express cookie properties](http://expressjs.com/en/4x/api.html#res.cookie).   

### buildStore(requestData, [aspects...]): {}
Builds aspect-store applying provided requestData onto aspects 

Arguments:
 - requestData - request data as required by `Aspect`;
 - aspects - array of functions which providing `requestData` returns an aspect.
 
Returns:
 - store - object, containing aspects identified by name.

### utils.resolveCookieDomain(url): String
Resolves a domain to set on cookie from provided url, ex. '.wix.com'.