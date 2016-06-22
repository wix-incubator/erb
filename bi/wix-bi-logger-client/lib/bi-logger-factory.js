'use strict';
const assert = require('./assert'),
  BiLogger = require('./bi-logger');

class BiLoggerFactory {
  constructor() {
    this._publishers = [];
    this._defaults = {};
    this._events = {};
  }

  addPublisher(publisher) {
    assert.defined(publisher, 'Publisher must be provided');
    assert.ok(typeof publisher === 'function', 'Expected a publisher function');
    this._publishers.push(publisher);
    return this;
  }

  setDefaults(defaults) {
    assert.defined(defaults, 'Defaults must be provided');
    assert.object(defaults, 'Defaults must be an object');
    this._defaults = defaults;
    return this;
  }

  updateDefaults(defaults) {
    assert.defined(defaults, 'Defaults must be provided');
    assert.object(defaults, 'Defaults must be an object');
    Object.assign(this._defaults, defaults);
    return this;
  }

  setEvents(events) {
    assert.defined(events, 'Events must be provided');
    assert.object(events, 'Events must be an object');
    this._events = events;
    return this;
  }

  logger(context) {
    return new BiLogger({publishers: this._publishers, defaults: this._defaults, events: this._events}, context);
  }
}

module.exports = BiLoggerFactory;