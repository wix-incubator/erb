'use strict';
const _ = require('lodash');

exports.exchangeMock = () => {
  return new ExchangeMock();
};

exports.anEvent = anEvent;

function ExchangeMock() {
  this.events = [];
  this.client = topic => {
    var self = this;
    self.topic = topic;
    return {
      send: event => self.events.push(event)
    };
  };
}

function anEvent(partial) {
  return _.merge({
    timestamp: 0,
    level: 'info',
    category: 'cat'
  }, partial);
}