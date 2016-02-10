'use strict';
const defaults = {
  sourceFolders: ['./templates'],
  targetFolder: './test/configs'
};

module.exports = opts => {
  const options = opts || defaults;
  return require('./lib/wix-config-emitter')(options);
};