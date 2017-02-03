const fs = require('fs'),
  join = require('path').join,
  assert = require('assert');

module.exports = class WixConfig {
  constructor(configDir) {
    assert(configDir, 'config directory is mandatory');
    this._confDir = configDir;
  }

  load(name) {
    return this.json(name);
  }

  json(name) {
    const configText = this.text(name && maybeAddJsonExtension(name));

    try {
      return JSON.parse(configText);
    } catch (e) {
      throw new Error(`Failed to parse config: '${name}.json' with message: ${e.message}`);
    }
  }

  text(name) {
    assert(name, 'config name is mandatory');
    return fs.readFileSync(join(this._confDir, `${name}`)).toString();
  }
};

function maybeAddJsonExtension(name) {
  return name.endsWith('.json') ? name : `${name}.json`;  
}
