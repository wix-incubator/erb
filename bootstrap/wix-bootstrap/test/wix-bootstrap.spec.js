'use strict';
const request = require('request'),
  expect = require('chai').expect,
  bootstrap = require('../lib/wix-bootstrap'),
  join = require('path').join;

const env = {
  PORT: 3000,
  MOUNT_POINT: '/my-app'
};


