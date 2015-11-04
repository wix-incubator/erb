# wix-express-compose-middleware

A composite middleware that composes multiple middlewares to be registered as one with express.
It is used to improve performance by reducing the routing overhead of different middlewares.

The wix-express-compose-middleware module keeps the semantics of the middlewares, including the passing of the
next function, req, res and sequence of running middlewares.

## install
```javascript
    npm install wix-express-compose-middleware --save
```

## usage
```javascript

var compose = require('wix-express-compose-middleware');

testApp.use(compose(middleware1, middleware2, middleware3));

// or

testApp.use(compose([middleware1, middleware2, middleware3]));

```
