'use strict';
const rp = require('request-promise'),
  within = require('./support/env').withinEnv;

describe('management app', () => {
  let env = { MOUNT_POINT: '/app-mount-point', MANAGEMENT_PORT: 8085 };

  it('should use default mount point, port if none are provided via env', within('defaults', {}, () => {
    return rp('http://localhost:8084/health/deployment/test');
  }));

  it('should respect MOUNT_POINT, MANAGEMENT_PORT environment variables', within('defaults', env, () => {
    return rp(`http://localhost:${env.MANAGEMENT_PORT}${env.MOUNT_POINT}/health/deployment/test`);
  }));
});