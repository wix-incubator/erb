# wix-jvm-bootstrap-testkit

Provides a way to run embedded [jvm bootstrap-based](https://github.com/wix/wix-framework-app-bootstrap) servers within tests.

Requirements:
 - machine set-up in accordance to: [nothing-to-prod](https://github.com/wix/wix-framework-app-bootstrap) (java, maven, wix nexus);
 - jvm-based server must have config (if any) named as `artifactId` and placed in src/main/resources;
 - jvm-based server must have logback.xml (if any) placed in src/main/resources;

How it works:
 - fetches configured artifact from artifactory (or local maven cache if present);
 - extracts;
 - starts bootstrap server;
 - waits until `../health/is_alive` is responding with 200;
 - tests run;
 - kills process.

## install

```js
npm install --save-dev wix-jvm-bootstrap-testkit
```

## usage

Say you have an jvm-based bootstrap-based artifact either installed in local repo (~/.m2/repository) or in artifactory:
 - groupId: com.wixpress.test;
 - artifactId: test;
 - version: 1.0.0-SNAPSHOT.

```js
const testkit = require('wix-jvm-bootstrap-testkit'),
  request = require('request'),
  expect = require('chai').expect;

describe('some', () => {
  const server = testkit.server({
    artifact: {
      groupId: 'com.wixpress.test',
      artifactId: 'test',
      version: '1.0.0-SNAPSHOT'
    }
  });

  server.beforeAndAfter();

  it('should show usage', done => {
    request.get(server.getUrl(), (error, response) => {
      expect(response.statusCode).to.equal(200);
    });
  });
});
```

## Api

### server(options)
Returns an instance of `JvmBootstrapServer` for given options:
 - artifact: mandatory,
  - groupId: maven groupId, mandatory;
  - artifactId: maven artifactId, mandatory;
  - version: maven version, mandatory;
 - port: server port to listen on.
 - config: app config to be injected into bootstrap app.

Example:

```js
{
  artifact: {
    groupId: 'com.wixpress.test',
    artifactId: 'test',
    version: '1.0.0-SNAPSHOT'
  },
  port: 8082
}
```

### JvmBootstrapServer
A server you can configure and start/stop multiple times.

**Note:** It extends [wix-testkit-base](../wix-testkit-base), so you get all operations it suppors (beforeAndAfter(), beforeAndAfterEach()...).

#### getPort()
Returns an port on which server will listen.

#### getUrl(path)
Returns a url on which server will listen, ex. 'http://localhost:3333'

Parameters:
 - path - optional, given path parameter, it will append it to base url, ex. `getUrl('ok')` -> `http://localhost:3000/ok`