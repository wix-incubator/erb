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
  const sessionBundle = bundle();
  const env = {NODE_ENV: 'production', APP_CONF_DIR: './target/configs'};

  before(() => emitConfigsWith(env, sessionBundle.publicKey));
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
    expect(decoder.decrypt(sessionBundle.token)).to.deep.equal(sessionBundle.session);
  }


  function bundle() {
    const key = new NodeRSA({b: 512});
    return sessionTestkit.v2.aValidBundle({
      privateKey: key.exportKey('private'),
      publicKey: key.exportKey('public')
    });
  }

  function emitConfigsWith(env, publicKey) {
    shelljs.rm('-rf', env.APP_CONF_DIR);
    return emitter({sourceFolders: ['./templates'], targetFolder: env.APP_CONF_DIR})
      .fn('library_passwd', 'new-session-public-key', publicKey)
      .emit();
  }
});
