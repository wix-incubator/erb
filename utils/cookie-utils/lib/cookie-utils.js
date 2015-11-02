'use strict';
const cookie = require('cookie'),
  _ = require('lodash');

module.exports.toHeader = cookies => {
  return _.map(cookies, serialize).join('; ');
};

module.exports.fromHeader = header => {
  return (header) ? cookie.parse(header) : {};
};

function serialize(value, key) {
  return cookie.serialize(key, value);
}