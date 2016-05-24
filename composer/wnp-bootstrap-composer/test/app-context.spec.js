'use strict';
const expect = require('chai').use(require('chai-as-promised')).expect,
  buildAppContext = require('../lib/app-context'),
  join = require('path').join,
  stdOutErrTestkit = require('wix-stdouterr-testkit');

describe('app-context', () => {
  const output = stdOutErrTestkit.interceptor().beforeAndAfterEach();

  const env = {
    PORT: '3000',
    MANAGEMENT_PORT: '3004',
    MOUNT_POINT: '',
    APP_CONF_DIR: './test/configs',
    APP_TEMPL_DIR: './templates',
    APP_LOG_DIR: './target/logs',
    HOSTNAME: 'localhost',
    NEW_RELIC_ENABLED: false,
    NEW_RELIC_NO_CONFIG_FILE: true,
    NEW_RELIC_LOG: 'stdout'
  };

  before(() => {
    process.env.NEW_RELIC_ENABLED = false;
    process.env.NEW_RELIC_NO_CONFIG_FILE = true;
    process.env.NEW_RELIC_LOG = 'stdout';
  });

  describe('defaults', () => {

    it('loads env', () =>
      buildAppContext(env, []).then(ctx =>
        expect(ctx.env).to.deep.equal(env))
    );

    it('loads app', () => {
      const packageJson = require(join(process.cwd(), 'package.json'));
      return buildAppContext(env, []).then(ctx =>
        expect(ctx.app).to.deep.equal({
          name: packageJson.name,
          version: packageJson.version
        }));
    });

    it('loads newrelic', () =>
      buildAppContext(env, []).then(ctx =>
        expect(ctx.newrelic).to.be.defined)
    );
  });

  describe('plugins', () => {

    it('should fail if plugin does not have "key"', () => {
      const plugin = aPlugin({key: undefined});
      return expect(buildAppContext(env, [plugin])).to.be.rejectedWith('plugin key must be defined')
    });

    it('should fail if plugin does not have "value"', () => {
      const plugin = aPlugin({value: undefined});
      return expect(buildAppContext(env, [plugin])).to.be.rejectedWith('plugin value must be defined')
    });

    it('should fail if "deps" is not an array', () => {
      const plugin = aPlugin({deps: {}});
      return expect(buildAppContext(env, [plugin])).to.be.rejectedWith('plugin deps must be array')
    });

    it('should load plugin and log plugin loading debug info', () => {
      const plugin = aPlugin({key: 'plugin-key', value: () => () => 'loaded'});
      return buildAppContext(env, [plugin])
        .then(ctx => expect(ctx['plugin-key']()).to.equal('loaded'))
        .then(() => expect(output.stderr).to.be.string('Loading plugin \'plugin-key\'\n'));
    });

    it('should sort plugins by dependencies', () => {
      const noDeps = aPlugin({key: 'one', value: () => 'loaded one'});
      const dependentOnNoDeps = aPlugin({key: 'two', value: ctx => ctx.one + ' loaded two', deps: ['one']});

      return buildAppContext(env, [dependentOnNoDeps, noDeps]).then(ctx => {
        expect(ctx.one).to.equal('loaded one');
        expect(ctx.two).to.equal('loaded one loaded two');
      });
    });

    it('should fail on unmet dependencies', () => {
      const plugin = aPlugin({key: 'one', deps: ['not-existent']});
      return expect(buildAppContext(env, [plugin])).to.be.rejectedWith('plugin with key \'one\' has unmet dependency \'not-existent\'');
    });

    it('should fail on circular dependencies', () => {
      const one = aPlugin({key: 'one', deps: ['two']});
      const two = aPlugin({key: 'two', deps: ['one']});

      return expect(buildAppContext(env, [one, two])).to.be.rejectedWith('Cyclic dependency: "two"');
    });

    it('should fail if plugin function returns a rejected promise', () => {
      const plugin = aPlugin({key: 'plugin-key', value: () => Promise.reject(Error('plugin-load-failed'))});
      return expect(buildAppContext(env, [plugin])).to.be.rejectedWith('plugin-load-failed')
        .then(() => expect(output.stderr).to.be.string('Loading plugin \'plugin-key\'\n'));
    });

    it('should fail if plugin function throws an exception and return a rejected promise', () => {
      const plugin = aPlugin({
        key: 'plugin-key', value: () => {
          throw new Error('plugin-load-threw');
        }
      });

      return expect(buildAppContext(env, [plugin])).to.be.rejectedWith('plugin-load-threw')
        .then(() => expect(output.stderr).to.be.string('Loading plugin \'plugin-key\'\n'));
    });


    it('should fail for multiple plugins with same key', () => {
      const plugin = aPlugin({key: 'plugin-key'});
      return expect(buildAppContext(env, [plugin, plugin])).to.be.rejectedWith('Error: Multiple plugins with same key \'plugin-key\' provided')
        .then(() => expect(output.stderr).to.be.string('Loading app context\n'));
    });
  });

  function aPlugin(opts) {
    const plugin = {
      key: 'some',
      value: () => '',
      deps: []
    };

    return {plugin: {di: Object.assign(plugin, opts)}};
  }
});