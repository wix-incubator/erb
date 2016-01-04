# wix-bi

Immutable object containing bi headers/cookies extracted from request. Actual extraction is done by companion module [wix-express-bi](../wix-express-bi).

## install

```js
npm install --save wix-bi
```

## usage

Within request:

```js
const wixBi = require('wix-bi');

//returns object containing bi cookies extracted from request.
wixBi.get();
```

For complete example see [wix-express-bi](../wix-express-bi)

## Api

### set(cookies)

Sets bi cookies, can be done only once during lifecycle of request.

### get()

Returns a list of bi cookies extracted from http request. Returned object has cookie names as object property names and cookie values as values assigned to these properties.