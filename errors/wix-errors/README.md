# wix-errors
Factory for your domain errors that play nicely with the platform plus a generic error class `WixError` that allows to have nested `Error` cause instances and renders it in the stack trace.


## install

```js 
npm install --save wix-errors
```

## usage

```js
const {WixBaseError, WixError, HttpStatus} = require('wix-errors');

const MyUniqueErrorCode = -666;

// define your error class
class MyDomainError extends WixBaseError(MyUniqueErrorCode, HttpStatus.NOT_FOUND) {
    constructor(msg, cause) {
        super(msg, cause);
    }
}

// in your domain logic
function meantToFail() {
    try {
        let theAnswer = 25 / 0;
    } catch(cause) {
      throw new MyDomainError('oops I did it again', cause);        
    }
}

// or use a built-in WixError
function meantToFail2() {
    try {
        let theAnswer = 25 / 0;
    } catch(cause) {
      throw new WixError('oops I did it again', cause);        
    }
}

```

# Api

## new WixError(message, cause)
Constructs an instance of `WixError` error with message and cause provided. WixError instances have 
`errorCode` set to -100 (Unknown) and HTTP status code set to `HttpStatus.INTERNAL_SERVER_ERROR` (500).
- `message` - mandatory, valid string
- `cause` - opt, instance of `Error`

If you want to define other values for `errorCode` or HTTP status code, please use `WixBaseError` class constructor (see below).

## WixBaseError(errorCode, httpStatusCode)
Returns a `class` with `errorCode` and `httpStatusCode` properties.

- `errorCode` opt, default is `-100`
- `httpStatusCode` opt, default is `HttpStatus.INTERNAL_SERVER_ERROR` 


