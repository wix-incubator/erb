'use strict';
const searchRegex = new RegExp('[^\\w|^\\-]', 'g');

module.exports.sanitize = sanitize;
module.exports.tagsToPrefix = tagsToPrefix;

function tagsToPrefix(tags) {
  return Object.keys(tags || {})
    .sort()
    .map(key => `${sanitize(key)}=${sanitize(tags[key])}`)
    .filter(el => el && el !== '')
    .join('.');
}

function sanitize(val) {
  return val.replace(searchRegex, '_');
}

