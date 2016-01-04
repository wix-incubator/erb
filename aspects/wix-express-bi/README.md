# wix-express-bi

http://expressjs.com/ middleware that populates [wix-bi](../wix-bi) with bi-related data.

## install

```js
npm install --save wix-express-bi
```

## usage

```js
const express = require('express'),
  wixExpressDomain = require('wix-express-domain');
  wixExpressBi = require('wix-express-bi'),
  wixBi = require('wix-bi');

const app = express();
app.use(wixExpressDomain);
app.use(wixExpressBi);

app.get('/', (req, res) => res.send(wixPetri.get()));

app.listen(3000);
```

## Api

TBD