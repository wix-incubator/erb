'use strict';
const fs = require('fs'),
  join = require('path').join,
  _ = require('lodash');

let configDir;

module.exports.setup = confDir => {
  configDir = confDir;
};

module.exports.reset = () => configDir = undefined;

module.exports.load = name => {
  validateConfigName(name);
  validateConfigDir(configDir);
  let configTxt = fs.readFileSync(join(configDir, `${name}.json`));

  try {
    return JSON.parse(configTxt);
  } catch (e) {
    throw new Error(`Failed to parse config: '${name}.json' with message: ${e.message}`);
  }
};

function validateConfigName(name) {
  if (_.isEmpty(name)) {
    throw new Error('config name must be provided and cannot be empty');
  }
}

function validateConfigDir() {
  if (_.isEmpty(configDir)) {
    throw new Error('configDir not present - did you forget to setup()?');
  }

  try {
    fs.statSync(configDir);
  } catch (e) {
    throw new Error(`Config dir: '${configDir}' missing or non-accessible.`);
  }

    if (fs.statSync(configDir).isDirectory() === false) {
      throw new Error(`Config dir provided: '${configDir}' is not a folder.`);
    }
}