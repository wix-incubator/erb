const expect = require('chai').use(require('chai-as-promised')).use(require('sinon-chai')).expect,
  injectModules = require('../../lib/context/inject-modules'),
  sinon = require('sinon'),
  Logger = require('wnp-debug').Logger;

describe('inject modules', () => {

  function injectModulesMocks() {
    const log = sinon.createStubInstance(Logger);
    const buildAppContext = (...plugins) => injectModules({appContext: {}, log, plugins});

    return {log, buildAppContext};
  }

  it('should not add plugin to context if "bind" is set to false', () => {
    const {log, buildAppContext} = injectModulesMocks();
    const plugin = aPlugin({key: 'statsd', value: () => 'ok', bind: false});

    return buildAppContext(plugin).then(context => {
      expect(context.statsd).to.be.undefined;
      expect(log.debug).to.have.been.calledWithMatch('Plugin with key \'statsd\' is configured to not be bound to context');
    });
  });

  it('should fail if plugin does not have "key"', () => {
    const {buildAppContext} = injectModulesMocks();
    const plugin = aPlugin({key: undefined});

    return expect(buildAppContext(plugin)).to.be.rejectedWith('plugin key must be defined');
  });

  it('should fail if plugin does not have "value"', () => {
    const {buildAppContext} = injectModulesMocks();
    const plugin = aPlugin({value: undefined});

    return expect(buildAppContext(plugin)).to.be.rejectedWith('plugin value must be defined')
  });

  it('should fail if "deps" is not an array', () => {
    const {buildAppContext} = injectModulesMocks();
    const plugin = aPlugin({deps: {}});

    return expect(buildAppContext(plugin)).to.be.rejectedWith('plugin deps must be array')
  });

  it('should load plugin and log plugin loading debug info', () => {
    const {log, buildAppContext} = injectModulesMocks();
    const plugin = aPlugin({key: 'plugin-key', value: () => () => 'loaded'});

    return buildAppContext(plugin).then(context => {
      expect(context['plugin-key']()).to.equal('loaded');
      expect(log.debug).to.have.been.calledWithMatch('Loading plugin \'plugin-key\'');
    });
  });

  it('should sort plugins by dependencies', () => {
    const {buildAppContext} = injectModulesMocks();
    const noDeps = aPlugin({key: 'one', value: () => 'loaded one'});
    const dependentOnNoDeps = aPlugin({key: 'two', value: ctx => ctx.one + ' loaded two', deps: ['one']});

    return buildAppContext(dependentOnNoDeps, noDeps).then(context => {
      expect(context.one).to.equal('loaded one');
      expect(context.two).to.equal('loaded one loaded two');
    });
  });

  it('should fail on unmet dependencies', () => {
    const {buildAppContext} = injectModulesMocks();
    const plugin = aPlugin({key: 'one', deps: ['not-existent']});

    return expect(buildAppContext(plugin))
      .to.be.rejectedWith('plugin with key \'one\' has unmet dependency \'not-existent\'');
  });

  it('should fail on circular dependencies', () => {
    const {buildAppContext} = injectModulesMocks();
    const one = aPlugin({key: 'one', deps: ['two']});
    const two = aPlugin({key: 'two', deps: ['one']});

    return expect(buildAppContext(one, two)).to.be.rejectedWith('Cyclic dependency: "two"');
  });

  it('should fail if plugin function returns a rejected promise', () => {
    const {buildAppContext} = injectModulesMocks();
    const plugin = aPlugin({key: 'plugin-key', value: () => Promise.reject(Error('plugin-load-failed'))});

    return expect(buildAppContext(plugin)).to.be.rejectedWith('plugin-load-failed');
  });

  it('should fail if plugin function throws an exception and return a rejected promise', () => {
    const {buildAppContext} = injectModulesMocks();
    const plugin = aPlugin({
      key: 'plugin-key', value: () => {
        throw new Error('plugin-load-threw');
      }
    });

    return expect(buildAppContext(plugin)).to.be.rejectedWith('plugin-load-threw');
  });

  it('should fail for multiple plugins with same key', () => {
    const {buildAppContext} = injectModulesMocks();
    const plugin = aPlugin({key: 'plugin-key'});

    return expect(buildAppContext(plugin, plugin))
      .to.be.rejectedWith('Multiple plugins with same key \'plugin-key\' provided');
  });

  function aPlugin(opts) {
    const plugin = {key: 'some', value: () => '', deps: []};

    return {plugin: {di: Object.assign(plugin, opts)}};
  }
});
