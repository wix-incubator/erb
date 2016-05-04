# wix-bi-logger-client

A universal javascript bi logger pluggable with platform/environment specific backends.

## install

```bash
npm i -S wix-bi-logger-client
```

## usage

```js
const biLogger = require('wix-bi-logger-client');

const biLoggerFactory = biLogger.factory()
  .addPublisher((evt, context) => console.log(Object.assign({}, evt, context)))
  .setDefaults({srcId: 100})
  .setEvents({'EVT-1': {evt1Id: 10}});

const bi = biLoggerFactory.logger({ctxId: 20});

bi.log({evtId: 1});
//will log: {evtId: 1, ctxId: 20, srcId: 100}

bi.log('EVT-1');
//will log: {evtId: 10, ctxId: 20, srcId: 100}

bi.log('EVT-1', {evtId: 200, exId: 12});
//will log: {evtId: 200, ctxId: 20, srcId: 100, exId: 12}

bi.updateDefaults({srcId: 200});
bi.log('EVT-1');
//will log: {evtId: 10, ctxId: 20, srcId: 200}

```

# Api

## factory(): BiLoggerFactory
Returns a new instance of `BiLoggerFactory`.

## BiLoggerFactory()
Class, whose instance is returned via `factory()`.

### BiLoggerFactory.addPublisher((evt, context) => Promise.resolve()): this
Adds a publisher function with signature `(event, context) => Promise.resolve()`, whose responsibility is to publish events to a destination of your choice: stdout, log file, http...

Multiple publishers can be added and be ivoked per `BiLogger.log()` invocation. 

### BiLoggerFactory.setDefaults(defaults): this
Adds defaults for events that are merged-into event for a publishing.

### BiLoggerFactory.updateDefaults(defaults): this
Performs a shallow merge (using `Object.assign`) of fields into the existing defaults for all subsequent events, use this if you have fields that are supplied with every event
and change very infrequently in the application.

### BiLoggerFactory.setEvents(events): this
Adds map of events, that can be referenced by key when logging an event (`BiLogger.log(key)`).

### BiLoggerFactory.logger(context): BiLogger
Returns an instance of `BiLogger` bound to provided `context`.

**Note:** Any modifications to a factory are effective for already created loggers.

## BiLogger(options, context)
Class representing an instance of bi logger produced by `BiLoggerFactory`.

Parameters:
 - options - object containing:
  - publishers - list of publishers;
  - defaults - object containing defaults for all events;
  - events - event map that is used when invoking `log(key)`.
 - context - context that is provided for publisher hook functions 

### BiLogger.log(event): Promise
Logs an event via attached publishers. Not that publishers can mutate provided event as each publisher get's his own instance of event.

Parameters:
 - event: object, mandatory - bi event contents;
 
### BiLogger.log(eventKey [, overrides]): Promise
Logs an event via attached publishers.
 
 Parameters:
  - eventKey: key of event defined in event map (options.events);
  - overrides: object containing extensions/overrides for an object referenced by eventKey.