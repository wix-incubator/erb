# wix-petri

Immutable object containing petri cookies extracted from request. Actual extraction is done by companion module [wix-express-petri](../wix-express-petri).

## install

```js
npm install --save wix-petri
```

## usage

Within request:

```js
const wixPetri = require('wix-petri');

//returns object containing petri cookies extracted from request.
wixPetri.get();
```

For complete example see [wix-express-petri](../wix-express-petri)

## Api

### set(cookies)

Sets petri cookies, can be done only once during lifecycle of request.

### get()

Returns a list of petri cookies extracted from http request. Returned object has cookie names as object property names and cookie values as values assigned to these properties.