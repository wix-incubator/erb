'use strict';

module.exports = name => {
  if (name.startsWith('wix-')) {
    return 'wix:' + name.substring(4);
  } else if (name.startsWith('wnp-')) {
    return 'wnp:' + name.substring(4);
  } else {
    return 'wix:' + name;
  }
};