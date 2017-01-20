'use strict';
const envSupport = require('..'),
  expect = require('chai').expect;

describe('env-support', () => {

  describe('basic', () => {
    it('should generate a basic environment object with port ranges between 3000..4000', () => {
      const env = envSupport.basic();
      expect(env.MOUNT_POINT).to.equal('/app');
      expect(env.APP_NAME).to.equal('app');
      expect(env.PORT).to.be.above(2999).and.be.below(4001);
      expect(env.MANAGEMENT_PORT).to.be.above(2999).and.be.below(4001);
    });

    it('should generate MANAGEMENT_PORT different than PORT', () => {
      const env = envSupport.basic();

      expect(env.MANAGEMENT_PORT).to.not.equal(env.PORT);
    });

    it('should merge properties of provided object into result', () => {
      const env = envSupport.basic({prop1: 'val1', APP_NAME: 'qwe'});

      expect(env.prop1).to.equal('val1');
      expect(env.APP_NAME).to.equal('qwe');
    });
  });

  describe('bootstrap', () => {

    it('should generate same as basic plus new relic disable, log dir, conf dif, debug', () => {
      const env = envSupport.bootstrap();
      expect(env.MOUNT_POINT).to.equal('');
      expect(env.APP_NAME).to.equal('app');
      expect(env.PORT).to.equal(3000);
      expect(env.MANAGEMENT_PORT).to.equal(3004);
      expect(env.HOSTNAME).to.equal('localhost');
      expect(env.NEW_RELIC_ENABLED).to.equal(false);
      expect(env.NEW_RELIC_NO_CONFIG_FILE).to.equal(true);
      expect(env.NEW_RELIC_LOG).to.equal('stdout');
      expect(env.APP_LOG_DIR).to.equal('./target/logs');
      expect(env.APP_CONF_DIR).to.equal('./target/configs');
      expect(env.APP_PERSISTENT_DIR).to.equal('./target/persistent');
      expect(env.APP_TEMPL_DIR).to.equal('./templates');
      expect(env.DEBUG).to.equal('wix:*');
      expect(env.DEBUG_COLORS).to.equal(true);
    });

    it('should merge properties of provided object into result', () => {
      const env = envSupport.bootstrap({prop1: 'val1', APP_NAME: 'qwe'});

      expect(env.prop1).to.equal('val1');
      expect(env.APP_NAME).to.equal('qwe');
    });
  });
});
