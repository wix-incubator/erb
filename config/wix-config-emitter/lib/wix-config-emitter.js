'use strict';
const erb = require('wix-erb'),
  fs = require('fs'),
  path = require('path'),
  shelljs = require('shelljs'),
  _ = require('lodash'),
  log = require('wnp-debug')('wix-config-emitter');

module.exports = opts => new ConfigEmitter(opts);

class ConfigEmitter {
  constructor(opts) {
    this.options = opts || {};
    this.data = {values: {}, functions: {}};
  }

  to(dest) {
    this.options.targetFolder = dest;
    return this;
  }

  fn(fnName) {
    const args = Array.prototype.slice.call(arguments, 1);
    const fnArgs = _.dropRight(args);

    if (!this.data.functions[fnName]) {
      this.data.functions[fnName] = [];
    }
    _.remove(this.data.functions[fnName], el => _.isEqual(_.dropRight(el), fnArgs));

    this.data.functions[fnName].push(args);
    return this;
  }

  val(from, to) {
    this.data.values[from] = to;
    return this;
  }

  emit(postProcess) {
    const configEntries = ConfigEmitter._configEntries(this.options);
    const erbs = configEntries.map(entry => erb({
      template: fs.readFileSync(entry.src).toString(),
      data: this.data
    }));
    const postProcessor = postProcess || (data => data);

    //TODO: validate targetFolder
    shelljs.rm('-rf', this.options.targetFolder);
    shelljs.mkdir('-p', this.options.targetFolder);

    return Promise.all(erbs)
      .then(configs => {
        configs = configs.map((config, index) => postProcessor(config, configEntries[index]));
        return _.zip(configEntries, configs)
      })
      .then(pairs => pairs.forEach(pair => fs.writeFileSync(pair[0].dest, pair[1])));
  }

  //TODO: validate sources
  static _configEntries(options) {
    let files = [];
    options.sourceFolders.forEach(folder => {
      if (shelljs.test('-d', folder) === false) {
        log.error(`Source config folder ${folder} does not exist or is not accessible`);
      } else {
        files = files.concat(shelljs.ls('-A', folder)
          .map(fileName => ConfigEmitter._fileEntry(folder, fileName, options.targetFolder)));
      }
    });
    return files;
  }

  static _fileEntry(srcFolder, srcFile, destFolder) {
    return {
      src: path.join(srcFolder, srcFile),
      dest: path.join(destFolder, ConfigEmitter._trimErb(srcFile))
    };
  }

  static _trimErb(fileName) {
    return fileName.substring(0, fileName.length - 4);
  }
}
