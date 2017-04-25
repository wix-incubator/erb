# wix-express-csrf

This module provides csrf protection.

We use the [csurf](https://github.com/expressjs/csurf) library.

By default, the csrf middleware expects to receive 2 tokens:
  1) The secret in the cookie.
  2) The hashed token in the x-xsrf-token in the header (hashed using [csrf](https://github.com/pillarjs/csrf) third party module).

We don't expect the client to provide a hashed token, only to copy the token from the cookie to the header.

Therefore, our extract value function creates the hash from the header token.

**Note:** this middleware requires [cookie-parser](https://github.com/expressjs/cookie-parser) to be present in express app.

## install

```bash
npm install --save wix-express-csrf
```

## usage

```js
const express = require('express'),
  wixExpressCsrf = require('wix-express-csrf');

const app = express();

app.use(wixExpressCsrf());
app.get('/', (req, res) => res.send('ok')); //expects both xsrf cookie and header to be present.

app.listen(3000);
```

Where in client you should either use [axios](https://github.com/mzabriskie/axios#request-config) which takes care of passing xsrf headers/cookies automatically, or otherwise resend `x-xsrf-token` header manually.


## API

### ()
Returns a middleware.
