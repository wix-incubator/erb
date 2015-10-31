'use strict';
const uuidGenerator = require('uuid-support'),
  _ = require('lodash');

exports.getOrCreate = req => {
  return _.reduce([idFromHeader, idFromParam, newId], (res, f) => {
    return res || f(req);
  }, false);
};

function idFromHeader(req) {
  return req.headers['x-wix-request-id'];
}

function idFromParam(req) {
  return req.query['request_id'];
}

function newId() {
  return uuidGenerator.generate();
}