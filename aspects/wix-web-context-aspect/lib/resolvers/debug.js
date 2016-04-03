'use strict';

exports.resolve = (query) => {
  return query['debug'] === 'true';
};
