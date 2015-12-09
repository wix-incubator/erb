'use strict';
const _ = require('lodash');

module.exports.build = args => {
  const urlParts = _.compact(args || []);

  if (_.isEmpty(urlParts) || urlParts.length > 2) {
    throw new Error('provided arguments must contain 1..2 elements');
  }

  if (urlParts.length === 1) {
    return urlParts[0];
  } else {
    let first = urlParts[0];
    let last = urlParts[1];

    if (!_.endsWith(first, '/')) {
      first = first + '/';
    }

    if (!_.startsWith(last, '/')) {
      last = '/' + last;
    }

    return `${first}_rpc${last}`;
  }
};