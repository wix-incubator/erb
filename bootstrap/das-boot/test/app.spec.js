'use strict';
const testkit = require('wix-bootstrap-testkit'),
  expect = require('chai').expect,
  request = require('request'),
  envSupport = require('env-support'),
  rpcTestkit = require('./rpc-testkit');

describe('app', function () {
  this.timeout(10000);

  //TODO: hardcoded config - nono;
  const metasiteRpcService = rpcTestkit.server({
    'ReadOnlyMetaSiteManager': {'getMetasSite': (params, respond) => respond({ result: {id: params[0], name: 'das-site'}})}
  }, {port: 3010});

  //TODO: add envSupport.docker or smth
  const app = testkit.bootstrapApp('./index.js', {env: envSupport.basic({APP_CONF_DIR: './config'})});

  metasiteRpcService.beforeAndAfter();
  app.beforeAndAfter();

  it('should return metasite details by metasiteId', done => {
    request.get(app.getUrl('/site/5ae0b98c-8c82-400c-b76c-a191b71efca5'), (err, res) => {
      expect(res.statusCode).to.equal(200);
      expect(JSON.parse(res.body)).to.contain.deep.property('id', '5ae0b98c-8c82-400c-b76c-a191b71efca5');
      expect(JSON.parse(res.body)).to.contain.deep.property('name', 'das-site');
      done();
    });
  });
});