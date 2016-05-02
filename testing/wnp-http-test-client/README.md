# wnp-http-test-client

Http client for testing based on [node-fetch](https://github.com/bitinn/node-fetch).

It adds basic dsl for common use cases and augments [node-fetch](https://github.com/bitinn/node-fetch) with 2 operations:
 - text() - response as string;
 - json() - returns response as json.

Response is often asserted-on during the tests, so added shorthands to save on extra `Promise` hop.

## install

```bash
npm install --save-dev wnp-http-test-client
```

## usage

```js
const http = require('wnp-http-test-client'),
  expect = require('chai').expect;

describe('example', () => {

  it('does a get by default', () =>
    http('http://localhost:3000');
  );

  it('has function for post', () =>
    http.post('http://localhost:3000');
  );

  it('provides a shorthands with response status verification', () =>
    http.okGet('http://localhost:3000');
  );

  it('adds function "json()" onto node-fetch response to get response as json', () =>
    http.okGet('http://localhost:3000')
      .then(res => expect(res.json()).to.deep.equal({value: 'for test'}));
  );

  it('adds function "text()" onto node-fetch response to get response as json', () =>
    http.okGet('http://localhost:3000')
      .then(res => expect(res.text()).to.equal('text response'));
  );

  it('provides helpers for request header manipulation', () =>
    http.okGet('http://localhost:3000', http.accept.json)
      .then(res => expect(res.json()).to.deep.equal({value: 'for test'}));
  );

});
```

## api

### (url, opts...)
Does a http get just like [node-fetch](https://github.com/bitinn/node-fetch).

Parameters:
 - url - :)
 - opts - varargs of objects that are merged together to pass-on to `node-fetch`.

### [method](url, opts...)
where method is one of 'get', 'post', 'put', 'delete';

```js
http.get(http://localhost:3000, {headers: {accept: 'application/json'}});
```

### ok[Method](url, opts...)
Does a get/post/put/delete and rejects a promise if it is not `res.ok`;

```js
http.okGet(http://localhost:3000, {headers: {accept: 'application/json'}});
```

### accept.json
Same as `{headers: {accept: 'application/json'}}`