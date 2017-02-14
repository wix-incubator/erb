# wix-errors
Factory for your domain/system errors that play nicely with the platform plus a generic error class `WixError` that allows to 
have nested `Error` cause instances and renders it in the stack trace.

The platform distinguishes between two types of errors:
- Business errors - constructed via `wixBusinessError` factory; Those types of errors should designate your business 
logic exceptional cases and should have their error messages safe for propagating to the client side.
- System errors - constructed via `wixSystemError` factory; Those types of errors should be used for other error cases 
(ie temporary unavailability of RPC endpoint/database/CPU/file system/NodeJS Lord etc).
 The messages of system error instances will not be revealed to the client side (but still will be available to monitoring systems aka NewRelic, logs etc).
 


## install

```js 
npm install --save wix-errors
```

## usage

```js
const {wixBusinessError, wixSystemError, WixError, HttpStatus} = require('wix-errors');

const MyUniqueErrorCode = -666;

// define your business error class
class MyAssetNotFoundError extends wixBusinessError(MyUniqueErrorCode, HttpStatus.NOT_FOUND) {
    constructor(msg, cause) {
        super(msg, cause);
    }
}

// define your system error class
class MongodbWentBerserkError extends wixSystemError(/* defaults to -100 and HttpStatus.INTERNAL_SERVER_ERROR */) {
    constructor(cause) {
        super('MongoDb has some issues', cause);
    }
}

// in your domain logic
function findMyAssetById(myAssetId) {
    try {
      mongodb.myCollection.findById(myAssetId);        
    } catch (cause) {
        if (cause instanceof mongodb.ObjectNotFound) {
            throw new MyAssetNotFoundError(`My asset with id ${myAssetId} not found`, cause);
        } else {
            throw new MongodbWentBerserkError(cause); 
        }
    }
}

// or use a built-in WixError which is an instance of wixSystemError
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

If you want to define other values for `errorCode` or HTTP status code, please use `wixErrorBase` class constructor (see below).

## wixBusinessError(errorCode, httpStatusCode) | wixSystemError(errorCode, httpStatusCode)
Returns a `class` with `errorCode` and `httpStatusCode` properties.

- `errorCode` opt, default is `-100`
- `httpStatusCode` opt, default is `HttpStatus.INTERNAL_SERVER_ERROR` 


