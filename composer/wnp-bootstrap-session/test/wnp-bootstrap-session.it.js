const sinon = require('sinon'),
  expect = require('chai').use(require('sinon-chai')).expect,
  Logger = require('wnp-debug').Logger,
  sessionTestkit = require('wix-session-crypto-testkit'),
  bootstrapSession = require('..'),
  NodeRSA = require('node-rsa'),
  emitter = require('wix-config-emitter'),
  shelljs = require('shelljs'),
  WixConfig = require('wix-config');

describe('bootstrap session', function () {
  this.timeout(10000);
  const {bundleV1, bundleV2} = bundles();
  const env = {NODE_ENV: 'production', APP_CONF_DIR: './target/configs'};

  before(() => emitConfigsWith(env, bundleV1.mainKey, bundleV2.publicKey));
  after(() => shelljs.rm('-rf', env.APP_CONF_DIR));

  it('loads keys from configuration files and returns session decoder', () => {
    const {sessionDecoder, log} = sessionDecoderWithCollaborators({
      env,
      configOverride: new WixConfig(env.APP_CONF_DIR)
    });

    expect(log.debug).to.have.been.calledWithMatch('production mode detected');
    assertCanDecodeSession(sessionDecoder);
  });

  function sessionDecoderWithCollaborators({env, configOverride}) {
    const config = sinon.createStubInstance(WixConfig);
    const log = sinon.createStubInstance(Logger);
    const sessionDecoder = bootstrapSession({env, config: configOverride || config, log});

    return {config, sessionDecoder, log};
  }

  function assertCanDecodeSession(decoder) {
    expect(decoder.v1.decrypt(bundleV1.token)).to.deep.equal(bundleV1.session);
    expect(decoder.v2.decrypt(bundleV2.token)).to.deep.equal(bundleV2.session);
  }


  function bundles() {
    const key = new NodeRSA({b: 512});
    const bundleV1 = sessionTestkit.v1.aValidBundle({mainKey: '1234211331224111'});
    const bundleV2 = sessionTestkit.v2.aValidBundle({
      privateKey: key.exportKey('private'),
      publicKey: key.exportKey('public')
    });

    return {bundleV1, bundleV2};
  }

  function emitConfigsWith(env, sessionKey, publicKey) {
    shelljs.rm('-rf', env.APP_CONF_DIR);
    return emitter({sourceFolders: ['./templates'], targetFolder: env.APP_CONF_DIR})
      .val('crypto_main_key', sessionKey)
      .fn('library_passwd', 'new-session-public-key', publicKey)
      .emit();
  }
});
