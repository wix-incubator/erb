'use strict';
const _ = require('lodash');

exports.basic = obj => _.merge(basicEnv(), obj || {});

function basicEnv() {
  const port = _.random(3000, 3996);
  return {
    PORT: port,
    MOUNT_POINT: '/app',
    APP_NAME: 'app',
    MANAGEMENT_PORT: port + 4
  };
}