'use strict';
const wixConfig = require('..'),
  expect = require('chai').expect;

describe('wix config', () => {

  beforeEach(() => {
    delete process.env.APP_CONF_DIR;
    wixConfig.reset();
  });

  describe('setup', () => {

    it('should not fail if confDir was not provided', () =>
      wixConfig.setup());

    it('should not fail on invalid set-up', () => {
      expect(() => wixConfig.setup('qwe')).to.not.throw();
    });
  });

  [{fn: 'load', config: 'config1'}, {fn: 'json', config: 'config1'}, {
    fn: 'text',
    config: 'config1.txt'
  }].forEach(setup => {

    describe(setup.fn, () => {

      it('should load a config from path defined in env variable if setup() was not done.', () => {
        process.env.APP_CONF_DIR = './test/configs/';
        expect(wixConfig[setup.fn](setup.config)).to.be.defined;
      });

      it('should load a config', () => {
        wixConfig.setup('./test/configs/');
        expect(wixConfig[setup.fn](setup.config)).to.be.defined;
      });

      it('should fail if module was not set-up', () => {
        wixConfig.reset();
        expect(() => wixConfig[setup.fn]('config1')).to.throw('configDir not present - did you forget to setup()?');
      });

      it('should fail if file does not exist or is not accessible', () => {
        wixConfig.setup('./test/configs/');
        expect(() => wixConfig[setup.fn]('does-not-exist')).to.throw('no such file or directory, open \'test/configs/does-not-exist');
      });

      it('should fail if config name is not provided', () => {
        wixConfig.setup('./test/configs/');
        expect(() => wixConfig[setup.fn]()).to.throw('cannot be empty');
      });

      it('should fail if module was not set-up', () => {
        expect(() => wixConfig.load('config1123')).to.throw('configDir not present - did you forget to setup()?');
      });

      it('should fail if config dir is missing/non-accessible', () => {
        wixConfig.setup('./test/configsz/');
        expect(() => wixConfig[setup.fn]('config1123')).to.throw('Config dir: \'./test/configsz/\' missing or non-accessible.');
      });

    });
  });

  describe('text config', () => {

    it('should load a config', () => {
      wixConfig.setup('./test/configs/');
      expect(wixConfig.text('config1.txt')).to.deep.equal('config1Text');
    });
  });

  describe('json config', () => {

    it('should load a config', () => {
      wixConfig.setup('./test/configs/');
      expect(wixConfig.load('config1')).to.deep.equal({'config1-key': 'config1-value'});
      expect(wixConfig.json('config1')).to.deep.equal({'config1-key': 'config1-value'});
    });

    it('should fail if file is not a valid json', () => {
      wixConfig.setup('./test/configs/');
      expect(() => wixConfig.load('non-json')).to.throw('Failed to parse config: \'non-json.json\' with message: Unexpected token q');
      expect(() => wixConfig.json('non-json')).to.throw('Failed to parse config: \'non-json.json\' with message: Unexpected token q');
    });
  });

});