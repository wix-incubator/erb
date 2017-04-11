const {join} = require('path');

module.exports = (port, mountPoint) => path => {
  const fullPath = join(mountPoint || '/', path || '');
  return `http://localhost:${port}${fullPath}`;
};
