const Start = require('start').default,
  reporter = require('octopus-start-reporter'),
  modules = require('octopus-start-modules'),
  dependencies = require('octopus-start-dependencies'),
  startTasks = require('octopus-start-tasks'),
  startModulesTasks = require('octopus-start-modules-tasks'),
  git = require('octopus-start-git'),
  prepush = require('octopus-start-prepush'),
  idea = require('octopus-start-idea'),
  markdownMagic = require('markdown-magic');

const start = Start(reporter());

module.exports['modules:list'] = () => start(modules.list());
module.exports['modules:where'] = moduleName => start(modules.where(moduleName));
module.exports['modules:sync'] = () => start(modules.sync());
module.exports['deps:sync'] = () => start(dependencies.sync());
module.exports['idea'] = () => start(idea());
module.exports['init'] = () => start(prepush());

module.exports.sync = () => start(
  modules.sync(),
  dependencies.sync(),
  module.exports.docs
)

/* links, installs, builds all modules */
module.exports.bootstrap = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.modules.removeUnchanged('bootstrap'),
  startModulesTasks.iter.async()((module, input, asyncReporter) => Start(asyncReporter)(
    startTasks.ifTrue(module.dependencies.length > 0)(() =>
      Start(asyncReporter)(startModulesTasks.module.exec(module)(`npm link ${module.dependencies.map(item => item.name).join(' ')}`))
    ),
    startModulesTasks.module.exec(module)('npm install --cache-min 3600 && npm link'),
    startModulesTasks.module.exec(module)('npm run build'),
    startModulesTasks.module.markBuilt(module, 'bootstrap')
  ))
)

/* run tests for changed modules */
module.exports.test = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.modules.removeUnchanged('test'),
  startModulesTasks.iter.forEach()(module => start(
    startModulesTasks.module.exec(module)('npm run test'),
    startModulesTasks.module.markBuilt(module, 'test')
  ))
)

/* unbuild all modules */
module.exports.unbuild = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.iter.async()((module, input, asyncReporter) => Start(asyncReporter)(
    startModulesTasks.module.markUnbuilt(module, 'bootstrap'),
    startModulesTasks.module.markUnbuilt(module, 'test')
))
)

/* clean all modules */
module.exports.clean = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.iter.async()((module, input, asyncReporter) => Start(asyncReporter)(
    startModulesTasks.module.exec(module)('rm -rf node_modules && rm -rf target')
    )
  )
)

/* run job in pullreq ci - build only modules that have changes since origin/master */
module.exports.pullreq = () => start(
  startTasks.exec('npm cache clear'),
  startModulesTasks.modules.load(),
  startModulesTasks.modules.removeGitUnchanged('origin/master'),
  startModulesTasks.modules.removeExtraneousDependencies(),
  startModulesTasks.iter.async()((module, input, asyncReporter) => Start(asyncReporter)(
    startTasks.ifTrue(module.dependencies.length > 0)(() =>
      Start(asyncReporter)(startModulesTasks.module.exec(module)(`npm link ${module.dependencies.map(item => item.name).join(' ')}`))
    ),
    startModulesTasks.module.exec(module)('npm install --cache-min 3600 && npm link'),
    startModulesTasks.module.exec(module)('npm run build')
    )
  ),
  startModulesTasks.iter.forEach()(module => start(
    startModulesTasks.module.exec(module)('npm run test')
  ))
)

module.exports.docs = () => start(() => {
  return function generateDocs(log /*, reporter*/) {
    return Promise.resolve().then(() => {
      markdownMagic('./bootstrap/docs/*.md');
    })
  }
});
