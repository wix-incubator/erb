# error handling

 - [emitting errors in express with default error handler](#emitting-errors-in-express-with-default-error-handler)
 - [do not terminate response in error!](#do-not-terminate-response-in-error)
 - [custom error handler](#custom-error-handler)
 - [retaining correct error names for transpiled code (babel)](#retaining-correct-error-names-for-transpiled-code-babel)


[wix-bootstrap-ng](..) provides a way to emit errors in request scope of [express](http://expressjs.com/) application so that:
 - errors are properly displayed in `new relic` with distinct names and nested error in the stack trace;
 - error results in desired HTTP status codes (401, 500...);
 
To achieve that [wix-bootstrap-ng](..) has several things added to base [express](http://expressjs.com/) app:
 - default error handler - [wix-express-error-handler](../../express/wix-express-error-handler);
 - base errors and factory for creating domain errors [wix-errors](../../errors/wix-errors);
 
 # emitting errors in express with default error handler
 
 ```js
const {wixBusinessError, HttpStatus} = require('wix-errors');
  myDomainPromiseFn = require('./lib/my-func');
 
// define your error class
class MyDomainError extends wixBusinessError(-1010, HttpStatus.NOT_FOUND) { //default error code: -100, default http status: 500.
    constructor(msg, cause) {
        super(msg, cause);
    }
}
 
module.exports = (app, context) => {
  app.get('/api/resource', (req, res, next) => {
    myDomainPromiseFn()
      .then(res => res.json(res);
      .catch(e => next(new MyDomainError('oh no', e))); // 'next' is important!
  });
  
  return app;
}
 ```
 
 What happened here?:
  - we defined a custom error that extends `wixBusinessError` class factory that exposes status and HTTP status which are respected by default error handler and emits response with defined HTTP status code;
    - it also accepts cause (original error) so that it's stack trace is is available in new relic;
  - we use `next` from express so that error goes through express error handling pipeline and:
    - is noticed by new relic which will show error with proper stack trace and error;
    - is intercepted by default error handler (if you have not defined your own).

# do not terminate response in error!

If you do terminate response in your middlewares or handlers, NEW RELIC WILL NOT DISPLAY THEM!.

```js
const {WixError} = require('wix-errors'),
  myDomainPromiseFn = require('./lib/my-func');
 
// define your error class
class MyDomainError extends WixError { // see, this extends not a facotry, but 'WixError'
    constructor(msg, cause) {
        super(msg, cause);
    }
}
 
module.exports = (app, context) => {
  app.get('/api/resource', (req, res) => {
    myDomainPromiseFn()
      .then(res => res.json(res);
      .catch(e => res.sendStatus(500)); // NONONO!
  });
  
  return app;
}
 ```

# custom error handler

If you want to have custom formatting of error in response you can plug-in your own express error handler and:
 - handle all errors or the ones you care for.

 ```js
const {WixError} = require('wix-errors'),
  myDomainPromiseFn = require('./lib/my-func');
 
// define your error class
class MyDomainError extends WixError { // see, this extends not a facotry, but 'WixError'
    constructor(msg, cause) {
        super(msg, cause);
    }
}
 
module.exports = (app, context) => {
  app.get('/api/resource', (req, res, next) => {
    myDomainPromiseFn()
      .then(res => res.json(res);
      .catch(e => next(new MyDomainError('oh no', e))); // 'next' is important!
  });
  
  app.use((err, req, res, next) => {
    if (err instanceOf MyDomainError) { // handle only errors you care for, pass rest to `next` that will be handled with default error handler
      res.json({code: 111}).status(500).end();
    }
    
    next(err); //will be logged, but response is terminated, so will not override.
  });
  
  return app;
}
 ```

What happened here?:
 - you defined you error extending `WixError` - have nice name, stack traces;
 - you handled your `MyDomainError` explicitly in custom error handler and passed it over to have it logged;
 - you pass other errors to default error handler and it does handle those properly (html or json, logging, wix-errors detection and handling).

# retaining correct error names for transpiled code (babel)

TBD @masterblaster - help

