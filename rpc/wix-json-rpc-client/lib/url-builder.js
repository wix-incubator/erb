const _ = require('lodash'),
  isUri = require('valid-url').isUri,
  assert = require('assert');

module.exports.build = args => {
  const urlParts = args || [];
  assert(urlParts.length > 0 && urlParts.length < 3, 'provided arguments must contain 1..2 elements');
  assert(isUri(urlParts[0]), `Passed uri(${urlParts[0]}) is not valid`);

  if (urlParts.length === 1) {

    return urlParts[0];
  } else {
    let first = urlParts[0];
    let last = urlParts[1];

    if (!_.endsWith(first, '/')) {
      first = first + '/';
    }

    if (_.startsWith(last, '/')) {
      last = _.replace(last, '/');
    }

    return `${first}${last}`;
  }
};
