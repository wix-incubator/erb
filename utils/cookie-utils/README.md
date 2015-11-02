# cookie-utils

Helper for parsing cookies from header value to an object and vice versa.

## install

```js
npm install --save cookie-utils
```

## usage

```js
const cookieUtils = require('cookie-utils');

const cookies = 'n=12; qwe=v1';

//to object
const obj = cookieUtils.fromHeader(cookies);
//back to header
const str = cookieUtils.toHeader(obj);
```

## Api
### fromHeader(header)
Converts cookie header in a form of 'cookie1=one; cookie2=two' to an object in form:

```js
{
  cookie1: one,
  cookie2: two
}
```

### toHeader(obj)
Converts cookie object created by `fromHeader(header)` back to header string.