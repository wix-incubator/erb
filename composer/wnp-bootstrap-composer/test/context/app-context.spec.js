'use strict';
const expect = require('chai').use(require('chai-as-promised')).expect,
  buildAppContext = require('../../lib/context/app-context'),
  stdOutErrTestkit = require('wix-stdouterr-testkit'),
  sinon = require('sinon'),
  HealthManager = require('../../lib/health/manager');

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

    it('loads newrelic', () =>
      buildAppContext({env}, {}, []).then(ctx =>
        expect(ctx.newrelic).to.be.defined)
    );
  });

  describe('plugins', () => {

    it('should not add plugin to context if "bind" is set to false', () => {
      let invoked = false;
      const plugin = aPlugin({value: () => invoked = true, bind: false});
      return buildAppContext({env}, {}, [plugin]).then(ctx => {
        expect(invoked).to.equal(true);
        expect(ctx['statsd']).to.be.undefined;
        expect(output.stderr).to.be.string('Plugin with key \'some\' is configured to not be bound to context');
      });
    });

    it('should fail if plugin does not have "key"', () => {
      const plugin = aPlugin({key: undefined});
      return expect(buildAppContext({env}, {}, [plugin])).to.be.rejectedWith('plugin key must be defined')
    });

    it('should fail if plugin does not have "value"', () => {
      const plugin = aPlugin({value: undefined});
      return expect(buildAppContext({env}, {}, [plugin])).to.be.rejectedWith('plugin value must be defined')
    });

    it('should fail if "deps" is not an array', () => {
      const plugin = aPlugin({deps: {}});
      return expect(buildAppContext({env}, {}, [plugin])).to.be.rejectedWith('plugin deps must be array')
    });

    it('should load plugin and log plugin loading debug info', () => {
      const plugin = aPlugin({key: 'plugin-key', value: () => () => 'loaded'});
      return buildAppContext({env}, {}, [plugin])
        .then(ctx => expect(ctx['plugin-key']()).to.equal('loaded'))
        .then(() => expect(output.stderr).to.be.string('Loading plugin \'plugin-key\''));
    });

    it('should sort plugins by dependencies', () => {
      const noDeps = aPlugin({key: 'one', value: () => 'loaded one'});
      const dependentOnNoDeps = aPlugin({key: 'two', value: ctx => ctx.one + ' loaded two', deps: ['one']});

      return buildAppContext({env}, {}, [dependentOnNoDeps, noDeps]).then(ctx => {
        expect(ctx.one).to.equal('loaded one');
        expect(ctx.two).to.equal('loaded one loaded two');
      });
    });

    it('should fail on unmet dependencies', () => {
      const plugin = aPlugin({key: 'one', deps: ['not-existent']});
      return expect(buildAppContext({env}, {}, [plugin])).to.be.rejectedWith('plugin with key \'one\' has unmet dependency \'not-existent\'');
    });

    it('should fail on circular dependencies', () => {
      const one = aPlugin({key: 'one', deps: ['two']});
      const two = aPlugin({key: 'two', deps: ['one']});

      return expect(buildAppContext({env}, {}, [one, two])).to.be.rejectedWith('Cyclic dependency: "two"');
    });

    it('should fail if plugin function returns a rejected promise', () => {
      const plugin = aPlugin({key: 'plugin-key', value: () => Promise.reject(Error('plugin-load-failed'))});
      return expect(buildAppContext({env}, {}, [plugin])).to.be.rejectedWith('plugin-load-failed')
        .then(() => expect(output.stderr).to.be.string('Loading plugin \'plugin-key\''));
    });

    it('should fail if plugin function throws an exception and return a rejected promise', () => {
      const plugin = aPlugin({
        key: 'plugin-key', value: () => {
          throw new Error('plugin-load-threw');
        }
      });

      return expect(buildAppContext({env}, {}, [plugin])).to.be.rejectedWith('plugin-load-threw')
        .then(() => expect(output.stderr).to.be.string('Loading plugin \'plugin-key\''));
    });


    it('should fail for multiple plugins with same key', () => {
      const plugin = aPlugin({key: 'plugin-key'});
      return expect(buildAppContext({env}, {}, [plugin, plugin])).to.be.rejectedWith('Multiple plugins with same key \'plugin-key\' provided')
        .then(() => expect(output.stderr).to.be.string('Loading app context'));
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

  describe('onShutdown', () => {

    it('should add function to assembler without name', () => {
      const fn = () => {};
      const shutdownAssembler = assembler();
      
      return buildAppContext({env}, shutdownAssembler, [])
        .then(context => {context.onShutdown(fn); return context})
        .then(() => {
          const registerdFunction = shutdownAssembler.registeredFunctions().pop();
          expect(registerdFunction).to.be.defined;
          expect(registerdFunction.fn).to.be.instanceof(Function);
          expect(registerdFunction.name).to.equal('client function');
        });
    });

    it('should add function to assembler with name', () => {
      const fn = () => {};
      const shutdownAssembler = assembler();

      return buildAppContext({env}, shutdownAssembler, [])
        .then(context => context.onShutdown(fn, 'aName'))
        .then(() => {
          const registerdFunction = shutdownAssembler.registeredFunctions().pop();
          expect(registerdFunction).to.be.defined;
          expect(registerdFunction.fn).to.be.instanceof(Function);
          expect(registerdFunction.name).to.equal('aName');
        });
    });

    it('should fail if function is not provided', () => {
      const shutdownAssembler = assembler();

      return buildAppContext({env}, shutdownAssembler, [])
        .then(context => expect(() => context.onShutdown()).to.throw)
    });

    it('should fail if provided thing is not a function', () => {
      const shutdownAssembler = assembler();

      return buildAppContext({env}, shutdownAssembler, [])
        .then(context => expect(() => context.onShutdown('not-a-function')).to.throw)
    });

  });

  describe('addHealthTest', () => {
    
    it('should register tests on a health test manager', () => {
      const manager = new HealthManager();
      const addHealthTest = sinon.spy(manager, 'add');
      const healthTest = () => Promise.resolve();

      return buildAppContext({env}, {}, [], manager)
        .then(context => context.management.addHealthTest('my-test', healthTest))
        .then(() => expect(addHealthTest).to.have.been.calledWith('my-test', healthTest));
    });
  });
  
  function assembler() {
    const addedFunctions = [];
    return {
      addShutdownFn: (fn, name) => addedFunctions.push({fn, name}),
      registeredFunctions: () => addedFunctions
    }
  }
});
