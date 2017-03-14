# wix-gatekeeper-testkit

Testkit for [wix-gatekeeper-client](../wix-gatekeeper-client) that fakes [gatekeeper](https://github.com/wix-private/authorization/tree/master/gatekeeper-server) and allows to return canned responses.

If you do not provide user permissions using `givenUserPermission`, all requests using gatekeeper client will be unauthorized.

## install

```bash
npm install --save-dev wix-gatekeeper-testkit
```

## usage

```js
const rpcFactory = require('wix-json-rpc-client').factory(),
  gatekeeperClient = require('wix-gatekeeper-client'),
  gatekeeperTestkit = require('wix-gatekeeper-testkit'),
  expect = require('chai').expect;

describe('gatekeeper test', () => {
  const gatekeeperServer = gatekeeperTestkit.server().beforeAndAfter();

  beforeEach(() => gatekeeperServer.reset());

  it('should authorize user', () => {
    gatekeeperServer.givenUserPermission('aUserGuid', 'aMetasiteId', {scope: 'aScope', action: 'anAction'});
	const gatekeeperFactory = gatekeeperClient.factory(rpcFactory.factory(), 'http://localhost:3029');

    // aspects must contain user session. When used from Express controller req.aspects will work
    return gatekeeperFactory.client(aspects)
	  .authorize('aMetasiteId', {scope: 'aScope', action: 'anAction'})
	  .then(res => expect(res).to.be.undefined); // because gatekeeper client resolves a promise with no parameters
  });

  it('should be unauthorized', () => {
   const gatekeeperFactory = gatekeeperClient.factory(rpcFactory.factory(), 'http://localhost:3029');

   // aspects must contain user session. When used from Express controller req.aspects will work
   return gatekeeperFactory.client(aspects)
   	  .authorize('aMetasiteId', {scope: 'aScope', action: 'anAction'})
	  .catch(e => expect(e).to.be.instanceof(gatekeeperClient.errors.GatekeeperAccessDenied));
  });
});
```

## Api

## server(opts): WixGatekeeperTestkit
Creates a new instance of a testkit. It extends [wix-testkit-base](../../testing/wix-testkit-base), so it gets all base methods (start, stop, beforeAndAfter, beforeAndAfterEach).

Parameters:
 - opts: object, with keys:
  - port: port to listen to, defaults to 3020;

## WixGatekeeperTestkit.givenUserPermission(userGuid, metasiteId, permission)
Specifies which calls to `authorize` should be authorized.
 - userGuid;
 - metasiteId;
 - permission - an object, containing fields `scope` and `action`;

if you do not call this method, all requests to `authorize` will fail with `GatekeeperAccessDenied`

## WixGatekeeperTestkit.givenUserPermissionHandler((userGuid, metaSiteId, permission) => true)
Allows to use custom authorization handler.
The authorization callback is being invoked with given arguments:
 - userGuid;
 - metasiteId;
 - permission - an object, containing fields `scope` and `action`;

The return value `true` of a callback means that permission is granted, and `false` - rejected.
Testkit allows to specify multiple handlers, by invoking same method multiple times.
The first handler to return `true` wins.

## WixGatekeeperTestkit.reset()
Resets testkit to be used again in tests.
