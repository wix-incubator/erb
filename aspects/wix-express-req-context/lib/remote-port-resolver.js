'use strict';

const _ = require('lodash');

exports.resolve = request => {
  return _.reduce([fromWixHeader, fromRequest], (res, f) => {
    return res || f(request);
  }, false);
};

var fromWixHeader = request => request.headers['x-wix-default-port'];
var fromRequest = request => request.connection.remotePort;
