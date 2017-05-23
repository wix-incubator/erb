const expect = require('chai').use(require('sinon-chai')).expect,
  configLoader = require('./../lib/configuration'),
  WixConfig = require('wix-config'),
  emitter = require('wix-config-emitter'),
  Logger = require('wnp-debug').Logger,
  sinon = require('sinon');

describe('configuration', () => {
  const APP_CONF_DIR = './target/config';
  const config = new WixConfig(APP_CONF_DIR);
  const log = sinon.createStubInstance(Logger);
  
  it('takes value from env', () => {
    expect(configLoader.load({env: {COOKIE_DOMAIN: '.foo.com'}, config, log})).to.equal('.foo.com');
    expect(log.debug).to.have.been.calledWithMatch(/domain.*foo.*env/);
  });
  
  it('defaults to .wix.com', () => {
    expect(configLoader.load({env: {}, config, log})).to.equal('.wix.com');
    expect(log.debug).to.have.been.calledWithMatch(/domain.*wix.*default/);
  });
  
  it('loads from config file in production', () => {
    const env = {NODE_ENV: 'production'};
    return writeConfigFileWith('boo.com')
      .then(() => expect(configLoader.load({env, config, log})).to.equal('.boo.com'));
  });
  
  function writeConfigFileWith(domain) {
    return emitter({targetFolder: APP_CONF_DIR, sourceFolders: ['./templates']})
      .val('base_domain', domain)
      .emit();
  }
});
