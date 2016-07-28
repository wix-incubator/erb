'use strict';
const join = require('path').join,
  Promise = require('bluebird'),
  log = require('wnp-debug')('wnp-bootstrap-composer'),
  assert = require('assert'),
  toposort = require('toposort'),
  bootRelic = require('./boot-relic'),
  artifactVersion = require('./artifact-version');

module.exports = buildAppContext;

function buildAppContext(env, plugins) {
  log.info('Loading app context');
  const packageJson = require(join(process.cwd(), 'package.json'));
  const current = {
    env: env,
    app: {
      name: packageJson.name,
      version: artifactVersion(process.cwd())
    },
    newrelic: bootRelic()
  };

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
    .then(loaded => ctx[plugin.plugin.di.key] = loaded);
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