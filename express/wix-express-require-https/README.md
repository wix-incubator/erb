# wix-express-require-https

Redirects requests made through http to https. Request protocol and url are read from aspects.

**Note:** this middleware is disabled for development environment, as in production, ssl is terminated at load balancer level and in development mode we do not necessarily have ssl terminating load balancer. If you want to test this middleware in a production-like setup, you can force-enable it by setting environment variable `WIX_ENABLE_REQUIRE_HTTPS`.

## Install

```bash
npm install --save wix-express-require-https
```

## Usage

```js
const express = require('express'),
      requireHttps = require('wix-express-require-https');

 express()
  .use(requireHttps)
  .get('/', (req, res) => res.end())
  .listen(3000);
```
