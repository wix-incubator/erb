'use strict';
const domain = require('domain');

const domainName = 'wix-domain';

exports.get = () => {
  let currentDomain = process.domain;

  if (!currentDomain) {
    currentDomain = domain.create();
    currentDomain.name = domainName;
  }

  return currentDomain;
};
