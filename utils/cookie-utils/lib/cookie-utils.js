'use strict';
const cookie = require('cookie'),
  _ = require('lodash');

module.exports.toHeader = cookies => {
  return _.map(cookies, (value, key) => cookie.serialize(key, value)).join('; ');
};

module.exports.fromHeader = header => {
  return (header) ? cookie.parse(header) : {};
};