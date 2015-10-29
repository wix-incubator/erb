'use strict';
const domain = require('domain');

const domainName = 'wix-domain';

exports.get = () => {
  let currentDomain = domain._stack.find(el => {
    return el.name === domainName;
  });

  if (!currentDomain) {
    currentDomain = domain.create();
    currentDomain.name = domainName;
  }

  return currentDomain;
};
