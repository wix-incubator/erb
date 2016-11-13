const _ = require('lodash');

module.exports.merge = maybeMerge;

function maybeMerge(dest, source, path) {
  Object.keys(source).forEach(key => {
    const currentPath = `${path || ''}${key}`;
    const currentValue = source[key];
    if (_.isPlainObject(currentValue)) {
      return maybeMerge(dest, currentValue, `${currentPath}.`)
    } else if ((_.has(dest, `${currentPath}`)) && currentValue !== _.get(dest, currentPath, currentValue)) {
      _.set(dest, currentPath, currentValue);
    }
  });
  return dest;
}
