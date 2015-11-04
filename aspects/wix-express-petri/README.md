# wix-express-petri

http://expressjs.com/ middleware that populates [wix-petri](../wix-petri) with petri A/B cookies.

## install

```js
npm install --save wix-express-petri
```

## usage

```js
const express = require('express'),
  wixExpressDomain = require('wix-express-domain');
  wixExpressPetri = require('wix-express-petri'),
  wixPetri = require('wix-petri');

const app = express();
app.use(wixExpressDomain);
app.use(wixExpressPetri);

app.get('/', (req, res) => {
    res.send(wixPetri.get());
});

app.listen(3000);
```

## Api
### ()
Returns middleware function.