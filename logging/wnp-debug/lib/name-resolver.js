'use strict';

module.exports = name => {
  let prefix = 'wnp';
  let suffix = name;
  if (name.startsWith('wix:') || name.startsWith('wnp:')) {
    prefix = name.substring(0, 3);
    suffix = name.substring(4);
  } else if (name.startsWith('wix-')) {
    prefix = 'wix';
    suffix = name.substring(4);
  } else if (name.startsWith('wnp-')) {
    prefix = 'wnp';
    suffix = name.substring(4);
  }

  return {
    'debug': `${prefix}:debug:${suffix}`,
    'info': `${prefix}:info:${suffix}`,
    'error': `${prefix}:error:${suffix}`
  }
};