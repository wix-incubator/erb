const Start = require('start').default,
  reporter = require('octopus-start-reporter'),
  modules = require('octopus-start-modules'),
  dependencies = require('octopus-start-dependencies'),
  startTasks = require('octopus-start-tasks'),
  startModulesTasks = require('octopus-start-modules-tasks'),
  git = require('octopus-start-git'),
  prepush = require('octopus-start-prepush'),
  idea = require('octopus-start-idea'),
  Gitdown = require('gitdown'),
  {readdirSync, readFileSync, writeFileSync} = require('fs'),
  {resolve, join} = require('path');

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

/* links, installs, builds all modules: TODO: add labeled built/unbuilt support*/
module.exports.bootstrap = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.iter.async()((module, input, asyncReporter) => Start(asyncReporter)(
    startTasks.ifTrue(module.dependencies.length > 0)(() =>
      Start(asyncReporter)(startModulesTasks.module.exec(module)(`npm link ${module.dependencies.map(item => item.path).join(' ')}`))
    ),
    startModulesTasks.module.exec(module)('npm install --cache-min 3600 && npm link'),
    startModulesTasks.module.exec(module)('npm run build')
  ))
)

/* run tests for changed modules */
module.exports.test = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.modules.removeUnchanged(),
  startModulesTasks.iter.forEach()(module => start(
    startModulesTasks.module.exec(module)('npm run test'),
    startModulesTasks.module.markBuilt(module)
  ))
)

/* unbuild all modules */
module.exports.unbuild = () => start(
  startModulesTasks.modules.load(),
  startModulesTasks.iter.async()((module, input, asyncReporter) => Start(asyncReporter)(
    startModulesTasks.module.markUnbuilt(module)
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

/* generate documents using gitdown: ./bootstrap/_docs/ -> ./bootstrap/docs/ */
module.exports.docs = () => start(() => {
  return function generateDocs(log /*, reporter*/) {
    return Promise.resolve().then(() => {
      const sourceFolder = './bootstrap/_docs/';
      const targetFolder = './bootstrap/docs/';

      const filesToProcess = readdirSync(sourceFolder).map(file => {
        return {src: resolve(join(sourceFolder, file)), dest: resolve(join(targetFolder, file))};
      });

      return filesToProcess.forEach(({src, dest}) => {
        log(`${src} -> ${dest}`);
        const gitdown = Gitdown.readFile(src)
        return gitdown.writeFile(dest);
      });
    })
  }
});
