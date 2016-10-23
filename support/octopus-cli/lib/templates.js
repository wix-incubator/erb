'use strict';
const fs = require('fs'),
  handlebars = require('handlebars').create();

require.extensions['.tmpl'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

const modulesTemplate = handlebars.compile(require("../files/idea/modules.xml.tmpl"));
const moduleImlTemplate = handlebars.compile(require("../files/idea/module.iml.tmpl"));
const workspaceXmlTemplate = handlebars.compile(require("../files/idea/workspace.xml.tmpl"));

module.exports.ideaModulesFile = function(targetFile, modules) {
  const content = modulesTemplate({modules: modules});
  fs.writeFileSync(targetFile, content);
};

module.exports.ideaModuleImlFile = function(targetFile, relPath, sourceFolders) {
  const content = moduleImlTemplate({sourceFolders: sourceFolders});
  fs.writeFileSync(targetFile, content);
};

module.exports.ideaWorkspaceXmlFile = function(targetFile, config) {
  const content = workspaceXmlTemplate({config});
  fs.writeFileSync(targetFile, content);
};