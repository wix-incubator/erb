'use strict';
const petriClient = require('wix-petri-client');

module.exports = (rpcFactory, laboratoryUrl) => {
  return aspects => petriClient.factory(rpcFactory, laboratoryUrl).client(aspects);
};