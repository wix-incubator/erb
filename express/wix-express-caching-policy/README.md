# caching policy

This module handles caching policy, the default usage is no cache.
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
  app.use('/specific', cp.specificAge(1000));

```

## API details

You can set one of four strategies:
```js


  // specific age
  cp.specificAge(1000)

  // infinite cache
  cp.infinite()

  // No cache
  cp.noCache()

  // Do not set any cache header
  cp.noHeaders()


```
