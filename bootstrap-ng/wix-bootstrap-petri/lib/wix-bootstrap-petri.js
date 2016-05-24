'use strict';
const petriClient = require('wix-petri-client');

module.exports = (rpcFactory, laboratoryUrl) => {
  return petriClient.factory(rpcFactory, laboratoryUrl);
};