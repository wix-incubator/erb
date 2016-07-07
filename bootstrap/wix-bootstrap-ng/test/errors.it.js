'use strict';
const testkit = require('./support/testkit');

describe('wnp bootstrap errors', function () {
  this.timeout(10000);

  testkit.app('default', {
    PORT: 3010,
    MANAGEMENT_PORT: 3014,
    MOUNT_POINT: '/app'
  }).beforeAndAfter();

  it('should log unhandled rejections', () => {});
  it('should kill worker process on uncaught exception', () => {});

});