# wix-petri

Immutable object containing petri cookies extracted from request. Actual extraction is done by companion module per web framework, ex. for http://expressjs.com/ - [wix-express-petri](../wix-express-petri).

## install

```js
npm install --save wix-petri
```

## usage

```js
const express = require('express'),
  wixExpressPetri = require('wix-express-petri'),
  wixPetri = require('wix-petri');

const app = express();
app.use(wixExpressPetri);

app.get('/', (req, res) => {
    res.send(wixPetri.get());
});

...
```

## Api

### set(cookies)

Sets petri cookies, can be done only once during lifecycle of request.

### get()

Returns a list of petri cookies extracted from http request. Returned object has cokie names as object proeprty names and cookie values as values assigned to these properties.