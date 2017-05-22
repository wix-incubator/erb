const bootstrapTestkit = require('wix-bootstrap-testkit'),
  rpcTestkit = require('wix-rpc-testkit'),
  configEmitter = require('wix-config-emitter'),
  {expect} = require('chai'),
  axios = require('axios');

describe('app', function () {
  const rpcServer = rpcTestkit.server();
  const mainApp = bootstrapTestkit.server('./index');

  before(() => {
    return emitConfigs(rpcServer)
      .then(() => Promise.all([rpcServer, mainApp].map(app => app.start())));
  });

  after(() => {
    return Promise.all([rpcServer, mainApp].map(app => app.stop()))
  });

  it('should return metasite details by metasiteId', () => {
    const siteId = '5ae0b98c-8c82-400c-b76c-a191b71efca5';
    rpcServer.when('ReadOnlyMetaSiteManager', 'listSites')
      .respond([{id: siteId, name: 'das-site'}]);

    return axios(mainApp.getUrl(`/sites/${siteId}`))
      .then(res => expect(res.data).to.deep.equal([{id: siteId, name: 'das-site'}]));
  });

  function emitConfigs(rpcServer) {
    return configEmitter({sourceFolders: ['./templates'], targetFolder: './target/configs'})
      .fn('rpc_service_url', 'com.wixpress.wix-meta-site-manager-webapp', rpcServer.getUrl())
      .emit();
  }
});
