'use strict';

module.exports = name => {
  if (name.startsWith('wix:') || name.startsWith('wnp:')) {
    return name;
  } else if (name.startsWith('wix-')) {
    return 'wix:' + name.substring(4);
  } else if (name.startsWith('wnp-')) {
    return 'wnp:' + name.substring(4);
  } else {
    return 'wnp:' + name;
  }
};