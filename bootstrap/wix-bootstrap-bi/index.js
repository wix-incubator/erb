'use strict';
module.exports.di = {
  key: 'bi',
  value: context => require('./lib/wix-bootstrap-bi')(context)
};