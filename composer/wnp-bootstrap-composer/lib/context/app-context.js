'use strict';
const Promise = require('bluebird'),
  log = require('wnp-debug')('wnp-bootstrap-composer'),
  assert = require('assert'),
  toposort = require('toposort'),
  bootRelic = require('../boot-relic');

module.exports = buildAppContext;

function buildAppContext(initialAppContext, shutdownAssembler, plugins, healthManager) {
  log.info('Loading app context');
  const current = Object.assign({}, initialAppContext, {
    newrelic: bootRelic(),
    management: {
      addHealthTest: (name, fn) => healthManager.add(name, fn),
      addShutdownHook: (name, fn) => shutdownAssembler.addFunction(name, fn)
    }
  });

  return withDebug('Loading plugins')
    .then(() => validatePluginDefinitions(plugins))
    .then(() => validateDependencies(plugins))
    .then(() => validateNoDuplicates(plugins))
    .then(() => sortDependencies(plugins))
    .then(sorted => Promise.each(sorted, plugin => loadPlugin(current, plugin)))
    .then(() => current);
}

function loadPlugin(ctx, plugin) {
  return withDebug(`Loading plugin '${plugin.plugin.di.key}'`)
    .then(() => plugin.plugin.di.value(ctx, plugin.opts))
    .then(loaded => {
      if (plugin.plugin.di.bind === false) {
        log.debug(`Plugin with key '${plugin.plugin.di.key}' is configured to not be bound to context`);
      } else {
        ctx[plugin.plugin.di.key] = loaded;
      }
    });
}

function validateNoDuplicates(plugins) {
  const keys = new Set();
  plugins.forEach(plugin => {
    if (keys.has(plugin.plugin.di.key)) {
      throw new Error(`Multiple plugins with same key '${plugin.plugin.di.key}' provided`);
    } else {
      keys.add(plugin.plugin.di.key);
    }
  });
}

function validatePluginDefinitions(plugins) {
  plugins.forEach(plugin => {
    assert.ok(plugin.plugin, 'plugin must be defined');
    assert.ok(plugin.plugin.di, 'plugin.di must be defined');
    assert.ok(plugin.plugin.di.key, 'plugin key must be defined');
    assert.ok(plugin.plugin.di.value, 'plugin value must be defined');
    assert.ok(Array.isArray(plugin.plugin.di.deps || []), 'plugin deps must be array');
  })
}

function validateDependencies(plugins) {
  const modules = new Set();
  plugins.forEach(plugin => modules.add(plugin.plugin.di.key));
  plugins.forEach(plugin => {
    const deps = plugin.plugin.di.deps || [];
    deps.forEach(dep => {
      if (!modules.has(dep)) {
        throw new Error(`plugin with key '${plugin.plugin.di.key}' has unmet dependency '${dep}'`);
      }
    });
  });
}

function sortDependencies(plugins) {
  const map = {};
  const graph = [];
  const sorted = [];
  plugins.forEach(plugin => {
    graph.push([plugin.plugin.di.key].concat(plugin.plugin.di.deps || []));
    map[plugin.plugin.di.key] = plugin;
  });

  toposort(graph).reverse().forEach(key => {
    if (key) {
      sorted.push(map[key]);
    }
  });

  return sorted;
}

function withDebug(msg) {
  return Promise.resolve().then(() => log.info(msg));
}
