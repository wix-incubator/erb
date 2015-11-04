'use strict';
const _ = require('lodash');

module.exports = function (middlewares) {
  middlewares = _.isArray(middlewares) ? middlewares : Array.prototype.slice.call(arguments);

  return (req, res, next) => {
    var pos = 0;

    function internalNext() {
      pos += 1;
      (pos >= middlewares.length) ? next() : middlewares[pos](req, res, internalNext);
    }

    middlewares[pos](req, res, internalNext);
  }
};