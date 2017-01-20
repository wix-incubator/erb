const searchRegex = new RegExp('[^\\w|^\\-]', 'g'),
  assert = require('assert');

module.exports.sanitize = sanitize;
module.exports.tagsToPath = tagsToPath;

function sanitize(val) {
  return val.replace(searchRegex, '_');
}

function tagsToPath(tags) {
  assert(Array.isArray(tags) && tags.length > 0, 'at least 1 tag is mandatory');
  return tags.map(tag => normalizeTag(validateTag(tag))).join('.');
}

function validateTag(tag) {
  assert(tag && typeof tag === 'string', 'tag is mandatory and must be a string');
  const equalsLocation = tag.indexOf('=');
  assert(equalsLocation > -1, 'tag must contain = separator');
  const parts = [tag.substring(0, equalsLocation), tag.substring(equalsLocation + 1, tag.length)];
  assert(parts.length === 2, 'tag must contain = separator');
  parts.forEach(part => assert(part, 'tag key/value is mandatory'));
  return tag;
}

function normalizeTag(tag) {
  const equalsLocation = tag.indexOf('=');
  const parts = [tag.substring(0, equalsLocation), tag.substring(equalsLocation + 1, tag.length)];
  return parts.map(sanitize).join('=');
}

