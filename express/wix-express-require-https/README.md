# wix-express-require-https

Redirects requests made through http to https. Request protocol and url are read from aspects.

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
