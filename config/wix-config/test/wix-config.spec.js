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


  // describe('text', () => {
  //  
  //   it('should fail for non-existent config file', () => {
  //     const config = new WixConfig('./non-existent/woop');
  //     expect(() => config.text('some.txt')).to.throw('');
  //   });
  //  
  // });

  // beforeEach(() => {
  //   delete process.env.APP_CONF_DIR;
  //   wixConfig.reset();
  // });
  //
  // describe('setup', () => {
  //
  //   it('should not fail if confDir was not provided', () =>
  //     wixConfig.setup());
  //
  //   it('should not fail on invalid set-up', () => {
  //     expect(() => wixConfig.setup('qwe')).to.not.throw();
  //   });
  // });
  //
  // [{fn: 'load', config: 'config1'}, {fn: 'json', config: 'config1'}, {
  //   fn: 'text',
  //   config: 'config1.txt'
  // }].forEach(setup => {
  //
  //   describe(setup.fn, () => {
  //
  //     it('should load a config from path defined in env variable if setup() was not done.', () => {
  //       process.env.APP_CONF_DIR = './test/configs/';
  //       expect(wixConfig[setup.fn](setup.config)).to.be.defined;
  //     });
  //
  //     it('should load a config', () => {
  //       wixConfig.setup('./test/configs/');
  //       expect(wixConfig[setup.fn](setup.config)).to.be.defined;
  //     });
  //
  //     it('should fail if module was not set-up', () => {
  //       wixConfig.reset();
  //       expect(() => wixConfig[setup.fn]('config1')).to.throw('configDir not present - did you forget to setup()?');
  //     });
  //
  //     it('should fail if file does not exist or is not accessible', () => {
  //       wixConfig.setup('./test/configs/');
  //       expect(() => wixConfig[setup.fn]('does-not-exist')).to.throw('no such file or directory, open \'test/configs/does-not-exist');
  //     });
  //
  //     it('should fail if config name is not provided', () => {
  //       wixConfig.setup('./test/configs/');
  //       expect(() => wixConfig[setup.fn]()).to.throw('cannot be empty');
  //     });
  //
  //     it('should fail if module was not set-up', () => {
  //       expect(() => wixConfig.load('config1123')).to.throw('configDir not present - did you forget to setup()?');
  //     });
  //
  //     it('should fail if config dir is missing/non-accessible', () => {
  //       wixConfig.setup('./test/configsz/');
  //       expect(() => wixConfig[setup.fn]('config1123')).to.throw('Config dir: \'./test/configsz/\' missing or non-accessible.');
  //     });
  //
  //   });
  // });
  //
  // describe('text config', () => {
  //
  //   it('should load a config', () => {
  //     wixConfig.setup('./test/configs/');
  //     expect(wixConfig.text('config1.txt')).to.deep.equal('config1Text');
  //   });
  // });
  //
  // describe('json config', () => {
  //
  //   it('should load a config', () => {
  //     wixConfig.setup('./test/configs/');
  //     expect(wixConfig.load('config1')).to.deep.equal({'config1-key': 'config1-value'});
  //     expect(wixConfig.json('config1')).to.deep.equal({'config1-key': 'config1-value'});
  //   });
  //
  //   it('should fail if file is not a valid json', () => {
  //     wixConfig.setup('./test/configs/');
  //     expect(() => wixConfig.load('non-json')).to.throw('Failed to parse config: \'non-json.json\' with message: Unexpected token q');
  //     expect(() => wixConfig.json('non-json')).to.throw('Failed to parse config: \'non-json.json\' with message: Unexpected token q');
  //   });
  // });

});
