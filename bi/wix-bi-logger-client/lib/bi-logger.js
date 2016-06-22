'use strict';
const assert = require('./assert');

class BiLogger {
  //TODO: validate args
  constructor(options, context) {
    this._publishers = options.publishers;
    this._defaults = options.defaults;
    this._events = options.events || {};
    this._context = context;
  }

  log(eventOrKey, eventOrUndefined) {
    assert.defined(eventOrKey, 'Event object or event key must be provided.');
    const event = this._eventOrExtractFromEvents(eventOrKey, eventOrUndefined);

    return Promise.all(this._publishers.map(publish => {
      const cloned = Object.assign({}, this._defaults, event);
      return BiLogger._withCatch(() => Promise.resolve().then(() => publish(cloned, this._context)))
        .catch(err => Promise.reject(new Error(`Publisher '${publish.name}' failed with error: '${err.message}'`)));
    }));
  }

  static _withCatch(fn) {
    try {
      return fn();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  _eventOrExtractFromEvents(eventOrKey, eventOrUndefined) {
    if (typeof eventOrKey === 'string') {
      const event = this._events[eventOrKey];
      if (!event) {
        throw new assert.AssertionError(`Event with key '${eventOrKey}' not found in event map.`);
      }

      if (eventOrUndefined) {
        return Object.assign({}, event, eventOrUndefined);
      } else {
        return event;
      }

    } else {
      return eventOrKey;
    }
  }

}

module.exports = BiLogger;