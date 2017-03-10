# wix-express-aspects

[Express](http://expressjs.com) middleware that:
 - builds provided [aspects](../wix-aspects) for each request and adds `aspects` object onto `request`;
 - applies data, exported by [aspects](../wix-aspects) onto response before flushing headers.

## install

```bash
npm install --save wix-express-aspects
```

## usage

```js
const express = require('express'),
 aspectMiddleware = require('wix-express-aspects'),
 aspect1 = require('some-aspect1'), //exports function reqData => new SomeAspect1(reqData)
 aspect2 = require('some-aspect2');
 
const app = express();
app.use(aspectMiddleware.get([aspect1, aspect2]));

//returns all aspects
app.get('/', (req, res) => {
    res.json(req.aspects);
});

//returns single aspect by name
app.get('/:name', (req, res) => {
    res.json(req.aspects[req.params.name]);
});

app.listen(3000);
```

## Api
### get([aspects...])
Returns middleware function.

Parameters: 
 - aspects - array of [Aspect](../wix-aspects) builder functions in a form of `reqData => new Aspect(reqData)`.
