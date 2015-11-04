'use strict';
const _ = require('lodash');

module.exports = function (middlewares) {
  middlewares = _.isArray(middlewares) ? middlewares : Array.prototype.slice.call(arguments);

  return (req, res, next) => {
    function internalNext(pos) {
      return () => (pos >= middlewares.length) ? next() : middlewares[pos](req, res, internalNext(pos + 1));
    }

    middlewares[0](req, res, internalNext(1));
  }
};