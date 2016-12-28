const path = require('path'),
  shelljs = require('shelljs'),
  fs = require('fs'),
  octopus = require('../../lib/octopus');

class ModuleBuilder {
  constructor(cwd, dir, isRoot) {
    this._isRoot = isRoot || false;
    this._cwd = cwd;
    this._dir = dir;
    this.addFolder(this._dir);
  }

  get dir() {
    return this._dir;
  }

  get cwd() {
    return this._cwd;
  }

  get isRoot() {
    return this._isRoot;
  }

  inDir(fn, noClean) {
    return inDir(fn, this, noClean);
  }

  markBuilt() {
    inDir(ctx => {
      const octo = octopus({cwd: ctx.dir});
      octo.modules.forEach(module => module.markBuilt());
    }, this, true);
    return this;
  }

  gitCommit() {
    inDir(ctx => {
      ctx.exec('git add -A && git commit -am ok');
    }, this, true);
    return this;
  }


  packageJson(overrides) {
    return this.addFile('package.json', aPackageJson(this._dir.split('/').pop(), overrides));
  }

  addFile(name, payload) {
    this.addFolder(path.dirname(name));

    if (payload && typeof payload !== 'string') {
      fs.writeFileSync(path.join(this._dir, name), JSON.stringify(payload, null, 2));
    } else {
      fs.writeFileSync(path.join(this._dir, name), payload || '');
    }

    return this;
  }

  addFolder(name) {
    shelljs.mkdir('-p', path.resolve(this._dir, name));
    return this;
  }

  module(name, cb) {
    const module = new ModuleBuilder(this._dir, path.join(this._dir, name), false);

    if (cb) {
      inDir(cb, module);
    } else {
      inDir(m => m.packageJson(m.dir.split('/').pop()), module);
    }
    return this;
  }

  octo(cmd, args) {
    const res = shelljs.exec(path.join(__dirname, '/../../scripts/octo.js') + ` ${cmd || ''} ${args || ''}`);

    if (res.code) {
      const error = new Error(`Program exited with error code: ${res.code} and output ${res.stdout} + ${res.stderr}`);
      error.output = res.stdout + res.stderr;
      throw error;
    } else {
      return res.stdout + res.stderr;
    }
  }

  exec(cmd) {
    const res = shelljs.exec(cmd);

    if (res.code) {
      throw new Error(`Script exited with error code: ${res.code} and output ${res.stdout} + ${res.stderr}`);
    } else {
      return res.stdout + res.stderr;
    }
  }

  readFile(path) {
    return shelljs.cat(path).stdout;
  }

  readJsonFile(path) {
    return JSON.parse(this.readFile(path));
  }

}

function aPackageJson(name, overrides) {
  return Object.assign({}, {
    name: name,
    version: '1.0.0',
    description: '',
    main: 'index.js',
    scripts: {
      test: 'echo "test script"',
      build: 'echo "build script"',
      release: 'echo "release script"'
    },
    author: '',
    license: 'ISC'
  }, overrides);
}

function inDir(fn, module, noClean) {
  const reset = (clean) => {
    process.chdir(module.cwd);
    if (clean === true) {
      shelljs.rm('-rf', module.dir);
    }
  };

  process.chdir(module.dir);

  try {
    fn(module);
    reset(module.isRoot && (!noClean));
  } catch (e) {
    reset(module.isRoot);
    throw e;
  }

  return module;
}

module.exports = ModuleBuilder;
