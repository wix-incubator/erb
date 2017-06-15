# wix-session-renewal

This module performs wixSession validation against the users segment. 

The validation occurs every 15 minutes for a given session and is performed by all wix services 
(handled seamlessly by the infrastructure platforms).

The reason for this validation is users blacklisting.
Also this mechanism is responsible for renewing the session cookie(s).

## install

```js
npm install --save wix-session-renewal
```

## usage

```js
const validatorFactory = require('wix-session-renewal');

// create instance of validator
const validator = validatorFactory(usersSegmentRpcClientFactory, wixSessionCrypto, toggler);

// later on in your express.js app
app.get('/protected-resource', (req, res, next) => {
  validator(req, res)
    .then(() => res.send('passed'))
    .catch(next);
});

```


## Api

###wix-session-renewal(rpcClientFactory, wixSessionCrypto, toggler)
Creates a new instance of `validator` function.

_params:_
 - `rpcClientFactory` - instance of [wix-json-rpc-client](../../rpc/wix-json-rpc-client) mapped to users segment
 - `wixSessionCrypto` - instance of [wix-session-crypto](../wix-session-crypto)
 - `toggler: req => Promise[boolean]` - toggler function whether to enable validations
 
 
 ###validator(req, res)
 Validates incoming request and adjusts response cookies if instructed by the users segment.
