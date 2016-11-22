const path = require('path'),
  shelljs = require('shelljs'),
  ModuleBuilder = require('./module-builder');

module.exports.project = octopusJsonFile => {
  return empty()
    .addFile('octopus.json', octopusJsonFile || {})
    .inDir(ctx => ctx.exec('git init'), true);
};

module.exports.empty = empty;

module.exports.defaults = {
  octopusJson: JSON.parse(shelljs.cat(path.resolve(__dirname + '/../../files/octopus.json')).stdout),
  gitHook: shelljs.cat(path.resolve(__dirname + '/../../files/pre-push')).stdout
};

function empty() {
  const projectDir = path.resolve('./target', Math.ceil(Math.random() * 100000).toString());
  return new ModuleBuilder(process.cwd(), projectDir, true);
}
