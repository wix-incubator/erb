# Wix-http-test-client

Http client for testing based on [node-fetch](https://github.com/bitinn/node-fetch).

It adds simpler dsl for common use cases working with endpoints. Removes extra work resolving `Promises`.
Adds expectations support for status, body and headers with [chai expect](http://chaijs.com/api/bdd/) or custom functions.

## Usage
```js
http.get('http://localhost:3000').verify() // validates status code to be succesfull 2xx

http.get('http://localhost:3000', { headers: 'X-Wix-Language': 'fr' }}).verify({
  status: 200, json: { result: 'ok' }, headers: { 'Cache-Control': 'no-cache' }
})

http.get('http://localhost:3000').verify({
  status: status => expect(status).to.be.within(200, 201)
})

http.post('http://localhost:3000', { body: { name: 'John' } }).verify({
  status: 201, json: { name: 'John' }
})  


// Expecting promise
http.get('http://localhost:3000', { headers: 'X-Wix-Language': 'fr' }}).then(resp => {
  expect(resp.status).be.equal(200);
  expect(resp.json()).be.deep.equal({ result: 'ok' });
  expect(resp.headers.get('Cache-Control')).to.equal('no-cache');
})

// Using verify and promise:
http.get('http://localhost:3000', { headers: 'X-Wix-Language': 'fr' }}
  .verify({ status: 200 })
  .then(resp => expect(resp.json()).be.deep.equal({ result: 'ok' }))
```

## Motivation
Using node-fetch sometimes adds to much boilerplate code. Example:
```js
// Using node-fetch

fetch('http://localhost:3000/dogs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Apollo' })
}).then(res => {
  expect(res.status).to.equal(201);
  return res.json();
}).then(res => {
  expect(res).to.deep.equal({ name: 'Apollo' });
})

// Using wix-http-test-client

http.post('http://localhost:3000/dogs', { body: { name: 'Apollo' } })
  .verify({ status: 201, json: { name: 'Apollo' } })
```      

## Install

```bash
npm install --save-dev wix-http-test-client
```

## Api

### `[method]`(url, options)

Parameters:
 - method - one of 'get', 'post', 'put', 'delete', 'options', 'patch'
 - url - request url
 - options - `node-fetch` options - https://github.com/bitinn/node-fetch#options. 
 Body is stringified if request Content-Type is json, so it must be passed as JavaScript object, otherwise string.
 For `post`, `put` and `patch` methods `Content-Type` header is set to `application/json` by default.

Returns promise with `verify` function which takes expectations and `text`, `json` functions returning resolved response body promises from node-fetch. Expectations:
 - status - expected response status code or custom verification function. If not provided status code is checked to be 2xx.
 - json - expected JSON response body or custom verification function.
 - text - expected text response body or custom verification function.
 - headers - expected headers present in response or custom verification function.

## Examples
More usages in [examples](https://github.com/wix-private/server-platform-js/blob/master/public/http/wix-http-test-client/test/examples.spec.js) and [lib tests](https://github.com/wix-private/server-platform-js/blob/master/public/http/wix-http-test-client/test/wix-http-test-client.spec.js)
