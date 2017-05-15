# RPC

Table of Contents

<!-- ⛔️ AUTO-GENERATED-CONTENT:START (TOC) -->
- [What is it?](#what-is-it)
- [Discovering services](#discovering-services)
- [Main concepts:](#main-concepts)
- [Add a new RPC](#add-a-new-rpc)
<!-- ⛔️ AUTO-GENERATED-CONTENT:START (TOC) -->
<!-- ⛔️ AUTO-GENERATED-CONTENT:END -->

## What is it?

 - Wix uses [JSON-RPC2](https://en.wikipedia.org/wiki/JSON-RPC) protocol for server-to-server communication with some important things:
  - request context (headers, cookies) being passed-down from client through call chain;
  - security - request signing and verification.

Each Scala server can expose multiple rpc services, each rpc service can have multiple method with or without parametrs.

## Discovering services

You can discover existing services via [Api Explorer](http://bo.wix.com/wix-api-explorer/).

## Main concepts:
 - Service (artifact, ex. 'com.wixpress.authorization.gatekeeper.gatekeeper-server') - used to get service url in production. url is injected by deployment system to your app configuration;
  - Rpc Service (class, group of methods) - Service can expose multiple Rpc Services (ex. 'SiteUsersService');
  - Method - what you invoke to get data, perform actions (ex. `fetchSiteUsers`);
  - Parameter - each method can have multiple parameters - both primitive and objects;
  - Response - service methods can return data - primitive or object.

## Add a new RPC

Here we will implement one of `metasite`'s RPCs. Complete working project you can find at [rpc-test-app](../test-apps/rpc).

1. Retrive essential inforamtion about the new wanted RPC service.
    - Use the [Wix Api Explorer](http://bo.wix.com/api-explorer/) to find:
      - $groupId.$artifactId of service you want to use;
      - wanted service name (`ReadOnlyMetaSiteManager`) and method (`listSites`).

2. Add a new key to the `.erb` configuration file:
    - Under the `templates` folder, locate your `*.json.erb` file.
    - Add a new key under `service` as the new service name (`metasite`).
    - Set the value to be a the parsing function on the RPC service name in the format: `groupId.artifactId`.
    
<!-- ⛔️ AUTO-GENERATED-CONTENT:START (CODE:src=../test-apps/rpc/templates/app.json.erb) -->
<!-- The below code snippet is automatically added from ../test-apps/rpc/templates/app.json.erb -->
```erb
{
  "services": {
    "metasite": "<%= rpc_service_url("com.wixpress.wix-meta-site-manager-webapp") %>"
  }
}
```
<!-- ⛔️ AUTO-GENERATED-CONTENT:START (CODE:src=../test-apps/rpc/templates/app.json.erb) -->
<!-- ⛔️ AUTO-GENERATED-CONTENT:END -->

```rpc_service_url``` is just an ruby function that is understood and processed by deployment system and actual service url is injected.

4. Setup RPC client
  `bootstrap` comes with preconfigured rpc client factory that you can use to build rpc clients. You can do it in your `lib/express-app.js`:

<!-- ⛔️ AUTO-GENERATED-CONTENT:START (CODE:src=../test-apps/rpc/lib/express-app.js) -->
<!-- The below code snippet is automatically added from ../test-apps/rpc/lib/express-app.js -->
```js
module.exports = (app, context) => {
  const config = context.config.json('app');
  const metasiteRpcClientFactory = context.rpc.clientFactory(config.services.metasite, 'ReadOnlyMetaSiteManager');

  app.get('/sites/:siteId', (req, res, next) => {
    metasiteRpcClientFactory.client(req.aspects)
      .invoke('listSites', req.params.siteId)
      .then(rpcResponse => res.json(rpcResponse))
      .catch(next);
  });
  return app;
};
```
<!-- ⛔️ AUTO-GENERATED-CONTENT:START (CODE:src=../test-apps/rpc/lib/express-app.js) -->
<!-- ⛔️ AUTO-GENERATED-CONTENT:END -->

  - `context.config.json('app')` just loads configuration file `app.json` that is produced from `templates/app.json.erb` by deployment system;
  - The returned object exposes a function that generates an rpc client instance to `metasite`'s entry point (`ReadOnlyMetaSiteManager`);
  - `aspects` are additional data (cookies, userGuid, etc...) on each http request. It's added automatically to the request object and we just need to pass it;
  - The `clientFactory.client()` function uses the request aspects to create an RPC client that sends RPC calls.

3. Test it

For testing you will need several things:
 - `wix-rpc-testkit` - to stub `ReadOnlyMetaSiteManager`;
 - `wix-config-emitter` - to generate application config just like deployment system would.

<!-- ⛔️ AUTO-GENERATED-CONTENT:START (CODE:src=../test-apps/rpc/test/express-app.it.js) -->
<!-- The below code snippet is automatically added from ../test-apps/rpc/test/express-app.it.js -->
```js
const bootstrapTestkit = require('wix-bootstrap-testkit'),
  rpcTestkit = require('wix-rpc-testkit'),
  configEmitter = require('wix-config-emitter'),
  {expect} = require('chai'),
  axios = require('axios');

describe('app', function () {
  this.timeout(10000);
  const rpcServer = rpcTestkit.server();
  const mainApp = bootstrapTestkit.server('./index');

  before(() => {
    return emitConfigs(rpcServer)
      .then(() => Promise.all([rpcServer, mainApp].map(app => app.start())));
  });

  after(() => {
    return Promise.all([rpcServer, mainApp].map(app => app.stop()))
  });

  it('should return metasite details by metasiteId', () => {
    const siteId = '5ae0b98c-8c82-400c-b76c-a191b71efca5';
    rpcServer.when('ReadOnlyMetaSiteManager', 'listSites')
      .respond([{id: siteId, name: 'das-site'}]);

    return axios(mainApp.getUrl(`/sites/${siteId}`))
      .then(res => expect(res.data).to.deep.equal([{id: siteId, name: 'das-site'}]));
  });

  function emitConfigs(rpcServer) {
    return configEmitter({sourceFolders: ['./templates'], targetFolder: './target/configs'})
      .fn('rpc_service_url', 'com.wixpress.wix-meta-site-manager-webapp', rpcServer.getUrl())
      .emit();
  }
});
```
<!-- ⛔️ AUTO-GENERATED-CONTENT:START (CODE:src=../test-apps/rpc/test/express-app.it.js) -->
<!-- ⛔️ AUTO-GENERATED-CONTENT:END -->