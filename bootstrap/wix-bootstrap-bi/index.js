'use strict';
const biFactory = require('./lib/wix-bootstrap-bi');

module.exports.di = {
  key: 'bi',
  value: context => biFactory(context.app.name, context.env.APP_LOG_DIR)
};