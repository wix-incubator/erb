'use strict';
const testkit = require('./support/testkit'),
  fetch = require('node-fetch');

describe('wnp bootstrap', function () {
  this.timeout(10000);
  testkit.app('default', {
    PORT: 3010,
    MANAGEMENT_PORT: 3014,
    MOUNT_POINT: '/app'
  }).beforeAndAfter();

  it('should listen on PORT/MOUNT_POINT as a main app', () =>
    fetch('http://localhost:3010/app/health/is_alive'));

  it('should listen on MANAGEMENT_PORT/MOUNT_POINT as a management app', () =>
    fetch('http://localhost:3014/app/health/deployment/test'));
});