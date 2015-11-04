# wix-express-middleware-composer

A middleware that composes multiple middlewares to be registered as one with express. It is used to improve performance by reducing the routing overhead of different middlewares.

The `wix-express-middleware-composer` module keeps the semantics of the middlewares, including the passing of the next function, req, res and sequence of running middlewares.

## install

```js
npm install --save wix-express-middleware-composer
```

## usage

```js
var compose = require('wix-express-compose-middleware');

testApp.use(compose(middleware1, middleware2, middleware3));
```

## Api

### (arguments)
Returns a composite middleware that can be plugged-in to `express` app;

`arguments` can be either varargs or array of `express` middlewares.
