'use strict';
const domain = require('domain');

exports.get = () => {
  if (!process.domain) {
    process.domain = domain.create();
  }
  return process.domain;
};
