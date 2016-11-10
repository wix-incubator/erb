# wix-express-caching-policy

This module handles caching policy, the default usage is no cache. A developer can override to the following options:
  - specific age;
  - infinite cache;
  - no headers;
  - no cache.

In case caching policy headers were set explicitly during request lifecycle, middleware does not override those.

## install

```bash
npm install --save wix-express-caching-policy
```

## usage

```js
const cachingPolicy = require('wix-express-caching-policy'),
  express = require('express');

  // specific time cache
  express
    .use('/specific-age', cp.specificAge(1000))
    .get('/', (req, res) => res.end())
    .listen(3000);
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