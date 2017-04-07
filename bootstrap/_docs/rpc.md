# RPC

Table of Contents
{"gitdown": "contents","rootId": "rpc"}

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
    
```js
{"gitdown": "include", "file": "../test-apps/rpc/templates/app.json.erb"}
```

```rpc_service_url``` is just an ruby function that is understood and processed by deployment system and actual service url is injected.

4. Setup RPC client
  `bootstrap` comes with preconfigured rpc client factory that you can use to build rpc clients. You can do it in your `lib/express-app.js`:

```js
{"gitdown": "include", "file": "../test-apps/rpc/lib/express-app.js"}
```

  - `context.config.json('app')` just loads configuration file `app.json` that is produced from `templates/app.json.erb` by deployment system;
  - The returned object exposes a function that generates an rpc client instance to `metasite`'s entry point (`ReadOnlyMetaSiteManager`);
  - `aspects` are additional data (cookies, userGuid, etc...) on each http request. It's added automatically to the request object and we just need to pass it;
  - The `clientFactory.client()` function uses the request aspects to create an RPC client that sends RPC calls.

3. Test it

For testing you will need several things:
 - `wix-rpc-testkit` - to stub `ReadOnlyMetaSiteManager`;
 - `wix-config-emitter` - to generate application config just like deployment system would.

```js
{"gitdown": "include", "file": "../test-apps/rpc/test/express-app.it.js"}
```
