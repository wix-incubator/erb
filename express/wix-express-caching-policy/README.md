# caching policy

This module handles caching policy, the default usage is no cache and it will be wired to the platform.
A developer can override to the following options:
* specific age
* infinite cache
* no headers
* no cache

## install

```js
npm install --save wix-express-caching-policy
```


## usage

```js
	const cachingPolicy = require('wix-express-caching-policy');

	// specific time cache
  app.use('/specific', cp.specific(1000));

  // infinite
  app.use('/infinite', cp.infinite());

  // noHeaders
  app.use('/noHeaders', cp.noHeaders());

  // no cache
  app.use('/noCache', cp.noCache());

```
