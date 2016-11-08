#!/usr/bin/env node
'use strict';
const log = require('../../lib/logger')(),
  shelljs = require('shelljs'),
  path = require('path'),
  forCommand = require('../../lib/commands').forCommand,
  templates = require("../../lib/templates");

const supportedSourceFolders = [
  {name: 'test', isTestSource: true},
  {name: 'tests', isTestSource: true},
  {name: 'src', isTestSource: false},
  {name: 'lib', isTestSource: false},
  {name: 'scripts', isTestSource: false}
];

exports.command = 'idea';
exports.desc = 'generate intellij idea project for all modules';
exports.builder = yargs => {
  return yargs
    .usage('\nUsage: octo idea')
    .help();
};
exports.handler = forCommand('octo idea', (octo, config, opts) => {
  const modules = octo.modules;
  const count = modules.length;

  if (count === 0) {
    log.warn('no modules found');
  } else {
    octo.inDir(() => {
      if (shelljs.ls('-A', '.idea').length > 0) {
        log.warn('Existing .idea folder found, deleting');
        shelljs.rm('-rf', '.idea');
      }
      if (shelljs.ls('-A', '*.iml').length > 0) {
        log.warn('Existing .iml file found, deleting');
        shelljs.rm('-f', '*.iml');
      }
      log.info('generating .idea folder');
      shelljs.mkdir('-p', '.idea');
      createVcsXml();
      createWorkspaceXml(modules);
      createModulesXml(modules);
    });

    modules.forEach((module, i) => module.inDir(() => {
      log.for(`${module.npm.name} (${module.relativePath}) (${i + 1}/${count})`, () => {

        if (shelljs.ls('-AR', '*.iml').length > 0) {
          log.warn('Existing .iml file found, deleting');
          shelljs.rm('-rf', '*.iml');
        }

        log.info('generating .iml file');
        createModuleIml(module);
      });
    }));
  }
});

function createWorkspaceXml(modules) {
  const node = shelljs.exec('which node').stdout.replace('\n', '');
  const config = {
    modules: modules.map(module => {
      return {name: module.npm.name, relativePath: module.relativePath, nodePath: node}
    }),
    mochaPackage: modules[0].relativePath + '/node_modules/mocha'
  };

  templates.ideaWorkspaceXmlFile(".idea/workspace.xml", config);
}

function createModulesXml(modules) {
  templates.ideaModulesFile(".idea/modules.xml", modules.map(module => {
    let group = (module.dir === module.relativePath) ? undefined : module.relativePath.replace('/' + module.dir, '');
    return {name: module.npm.name, dir: module.relativePath, group: group};
  }));
}

function createModuleIml(module) {
  const directories = shelljs.ls()
    .filter(entry => shelljs.test('-d', entry));

  const sourceFolders = [];
  supportedSourceFolders.forEach(sourceFolder => {
    if (directories.indexOf(sourceFolder.name) > -1)
      sourceFolders.push(sourceFolder);
  });

  templates.ideaModuleImlFile(module.npm.name + ".iml", module.relativePath, sourceFolders);
}

function createVcsXml() {
  shelljs.cp(path.join(__dirname, '../../files/idea/vcs.xml'), '.idea/');
}
