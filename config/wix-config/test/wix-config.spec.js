'use strict';
const wixConfig = require('..'),
  expect = require('chai').expect;

describe('wix config', () => {

  describe('setup', () => {

    it('should not fail if confDir was not provided', () =>
      wixConfig.setup());

    it('should pass for valid options', () => {
      expect(() => wixConfig.setup('qwe')).to.not.throw();
    });
  });

  describe('load', () => {
    it('should load a config', () => {
      wixConfig.setup('./test/configs/');
      expect(wixConfig.load('config1')).to.deep.equal({'config1-key': 'config1-value'});
    });

    it('should load multiple configs', () => {
      wixConfig.setup('./test/configs/');
      expect(wixConfig.load('config1')).to.deep.equal({'config1-key': 'config1-value'});
      expect(wixConfig.load('config2')).to.deep.equal({'config2-key': 'config2-value'});
    });

    it('should fail if module was not set-up', () => {
      wixConfig.reset();
      expect(() => wixConfig.load('config1')).to.throw('configDir not present - did you forget to setup()?');
    });

    it('should fail if file does not exist or is not accessible', () => {
      wixConfig.setup('./test/configs/');
      expect(() => wixConfig.load('config15')).to.throw(`no such file or directory, open 'test/configs/config15.json'`);
    });


    it('should fail if file is not a valid json', () => {
      wixConfig.setup('./test/configs/');
      expect(() => wixConfig.load('non-json')).to.throw(`Failed to parse config: 'non-json.json' with message: Unexpected token q`);
    });


    it('should fail if config name is not provided', () => {
      expect(() => wixConfig.load()).to.throw('cannot be empty');
    });

    it('should fail if module was not set-up', () => {
      wixConfig.setup('./test/configs/');
      expect(() => wixConfig.load('config1123')).to.throw(`no such file or directory, open 'test/configs/config1123.json'`);
    });

    it('should fail if config dir is missing/non-accessible', () => {
      wixConfig.setup('./test/configsz/');
      expect(() => wixConfig.load('config1123')).to.throw(`Config dir: './test/configsz/' missing or non-accessible.`);
    });

    it('should fail if config dir is missing/non-accessible', () => {
      wixConfig.setup('./test/configs/config1.json');
      expect(() => wixConfig.load('config1123')).to.throw(`Config dir provided: './test/configs/config1.json' is not a folder.`);
    });
  });
});