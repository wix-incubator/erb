const WixConfig = require('..'),
  expect = require('chai').expect;

describe('wix config', () => {

  it('fails when configDir name is not provided', () => {
    expect(() => new WixConfig()).to.throw('is mandatory');
  });

  ['load', 'json', 'text'].forEach(fn => {

    describe(`${fn} validation and error handling`, () => {

      it('fails when config name is not provided', () => {
        const config = new WixConfig('./non-existent/woop');
        expect(() => config[fn]()).to.throw('name is mandatory');
      });

      it('fails for non-existent config file', () => {
        const config = new WixConfig('./non-existent/woop');
        expect(() => config[fn]('some.txt')).to.throw('');
      });
    });
  });

  describe('text', () => {

    it('loads config', () => {
      const config = new WixConfig('./test/configs');
      expect(config.text('config1.txt')).to.equal('config1Text');
    });

  });

  ['load', 'json'].forEach(fn => {

    describe(fn, () => {

      it('fails when config is not json', () => {
        const config = new WixConfig('./test/configs');
        expect(() => config[fn]('non-json')).to.throw();
      });

      it('loads json config with extension provided', () => {
        const config = new WixConfig('./test/configs');
        expect(config[fn]('config1.json')).to.deep.equal({'config1-key': 'config1-value'});
      });

      it('loads json config without extension provided', () => {
        const config = new WixConfig('./test/configs');
        expect(config[fn]('config1')).to.deep.equal({'config1-key': 'config1-value'});
      });
      
    });
  });
});
