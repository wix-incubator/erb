'use strict';

module.exports = (fn, ref) => Promise.resolve().then(fn)
  .then(stop => {
    if (ref) {
      ref(stop instanceof Function ? stop : noop);
    }
    return stop;
  });

function noop() {
}