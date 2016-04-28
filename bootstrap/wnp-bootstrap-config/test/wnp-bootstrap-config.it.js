'use strict';
const expect = require('chai').expect,
  envSupport = require('env-support'),
  testkit = require('wix-childprocess-testkit'),
  fetch = require('node-fetch');

describe('bootstrap config', () => {
  const env = envSupport.bootstrap({APP_CONF_DIR: './test/app/configs'});
  testkit
    .server('./test/app', {env}, testkit.checks.httpGet('/health/is_alive'))
    .beforeAndAfter();

  it('should return an instance of config loader bound to provided config directory', () =>
    fetch(`http://localhost:${env.PORT}/${env.MOUNT_POINT}`)
      .then(res => res.json())
      .then(json => expect(json).to.deep.equal({key: 'value'}))
  );
});