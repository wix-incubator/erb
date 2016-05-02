'use strict';

module.exports.di = {
  key: 'plugin',
  value: () => Promise.resolve('custom-plugin')
};