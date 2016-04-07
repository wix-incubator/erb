'use strict';

module.exports.eventCollectingPublisher = events => {
  return function EventCollectingPublisher(evt, ctx) {
    return Promise.resolve(events.push(Object.assign({}, evt, ctx)));
  };
};

module.exports.eventMutatingPublisher = () => {
  return function EventMutatingPublisher(evt) {
    return Promise.resolve(evt.mutated = true);
  };
};

module.exports.promiseRejectingPublisher = () => {
  return function PromiseRejectingPublisher() {
    return Promise.reject(new Error('publisher failed'));
  };
};

module.exports.throwingPublisher = () => {
  return function ThrowingPublisher() {
    throw new Error('publisher threw');
  };
};