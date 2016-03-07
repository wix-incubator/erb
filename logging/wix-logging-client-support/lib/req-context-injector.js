'use strict';
//const reqContext = require('wix-req-context');

module.exports = event => {
  //const current = reqContext.get() || {};
  const current = {};
  event.req = {};
  event.req.requestId = current.requestId;
  return event;
};