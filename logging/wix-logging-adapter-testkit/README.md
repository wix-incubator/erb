# wix-logging-adapter-testkit

Helper for testing wix-logging-*-adapters in an e2e environment.

# installation

```js
npm i --save-dev wix-logging-adapter-testkit
```

# usage

Say we have an `./test/app.js` which tests info log in worker process:

```js
require('../../').worker({
  setup: () => {},
  action: () => console.info('INFO log message is')
});
```

Test using mocha would be:

```js
describe('adapter', () => {
  it(`should log and event within worker`,done => {
    require('wix-logging-adapter-testkit').run(
      './app.js', 
      {level: 'info', msg: 'log message is'}, 
      done);
  });
```

# api

## run(app, event, done)

Run given **app** and verify results against **result**:
 - app - path to a .js file, ex. './apps/sample.js';
 - results - object containing:
   - level - logging level (info, debug, error...);
   - msg - logged message, optional in case error is provided;
   - error - logged error, optional in case msg is provided.

## worker(context)

Run in a clustered environment on worker process:
 - context object containing:
  - setup - function to set-up a logger;
  - action - function which logs, ex. `() => console.info('hi there')`;

## master(context)

Same as worker, but `setup` and `action` are performed within cluster master. 

## express(context)

Same as worker, but `setup` is performed within worker process and `action` within request scope. 