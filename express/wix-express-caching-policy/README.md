# wix-express-caching-policy

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
  app.use('/specific-age', cp.specificAge(1000));
  
```

## Api

### specificAge(ageSec)
Sets 'Cache-Control' header to provided 'max-age'.

Arguments:
 - ageSec - age in seconds.

### specificAge(ageSec)
Sets 'Cache-Control' header to provided 'max-age'.

Arguments:
 - ageSec - age in seconds.

### infinite()
Sets 'Cache-Control' header 'max-age' to 2419200.

### noHeaders()
Does not set caching headers at all.

### noCache()
Sets headers 'Pragma' -> 'no-cache' and 'Cache-Control' -> 'no-cache'.

