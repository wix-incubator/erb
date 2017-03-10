
module.exports = name => {
  let prefix = 'wix';
  let suffix = name;
  if (name.startsWith('wix:') || name.startsWith('wnp:')) {
    suffix = name.substring(4);
  } else if (name.startsWith('wix-') || name.startsWith('wnp-')) {
    suffix = name.substring(4);
  }

  return {
    'debug': `${prefix}:debug:${suffix}`,
    'info': `${prefix}:info:${suffix}`,
    'error': `${prefix}:error:${suffix}`
  }
};
