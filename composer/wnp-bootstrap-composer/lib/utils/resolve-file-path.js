const path = require('path');

module.exports = (cwd, location) => {
  return path.isAbsolute(location) ? location : path.join(cwd, location);
};
