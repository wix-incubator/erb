'use strict';

module.exports.di = {
  key: 'plugin',
  value: (context, opts) => Promise.resolve('custom-plugin ' + opts.text)
};