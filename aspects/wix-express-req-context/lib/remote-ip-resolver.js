'use strict';

const _ = require('lodash');

exports.resolve = request => {
  return _.reduce([fromWixHeader, fromHeader, fromRequest], (res, f) => {
    return res || f(request);
  }, false);
};

var fromWixHeader = request => request.headers['x-wix-ip'];
var fromHeader = request => request.headers['x-forwarded-for'];
var fromRequest = request => request.connection.remoteAddress;
