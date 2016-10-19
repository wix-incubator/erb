'use strict';
const devSupport = require('wnpm-dev'),
  shelljs = require('shelljs'),
  path = require('path'),
  maybeMerge = require('./merge'),
  diff = require("jsondiffpatch").diff,
  _ = require('lodash'),
  fs = require('fs');

module.exports = opts => {
  const dir = opts.cwd;
  const skips = new Set(opts.excludes || []);
  const allPackagesToBuild = devSupport.findListOfNpmPackagesAndLocalDependencies(dir).filter(pkg => !skips.has(pkg.npm.name));
  const changedPackages = devSupport.findChangedPackages(dir, allPackagesToBuild);
  const sortedPackagesToBuild = devSupport.sortPackagesByDependencies(allPackagesToBuild);

  const changed = toPackagePaths(changedPackages);
  const needsRebuild = toPackagePaths(devSupport.figureOutAllPackagesThatNeedToBeBuilt(allPackagesToBuild, changedPackages));
  const modules = sortedPackagesToBuild.map(pkg => {
    pkg.hasChanges = () => changed.has(pkg.relativePath);
    pkg.needsRebuild = () => needsRebuild.has(pkg.relativePath);
    pkg.packageJson = JSON.parse(shelljs.cat(path.join(pkg.fullPath, 'package.json')).stdout);
    pkg.inDir = fn => {
      process.chdir(pkg.fullPath);
      const res = fn();
      process.chdir(dir);
      return res;
    };
    pkg.exec = (what, verbose) => {
      const shouldChange = process.cwd() === pkg.fullPath ? false : true;
      if (shouldChange) {
        process.chdir(pkg.fullPath);
      }

      const res = shelljs.exec(what, {silent: !verbose});

      if (res === null) {
        process.exit(1);
      }

      if (res.code) {
        throw new Error(`Exit code: ${res.code}, output: ${res.stdout} ${res.stderr}`);
      }

      if (shouldChange) {
        process.chdir(dir);
      }
      return res;
    };


    pkg.links = () => {
      return devSupport.npmLinks(pkg, allPackagesToBuild);
    };
    pkg.markUnbuilt = () => devSupport.makePackagesUnbuilt([pkg.fullPath]);

    pkg.markBuilt = () => devSupport.makePackageBuilt(pkg.fullPath);

    pkg.merge = (overrides, isSave) => {
      const packageJson = JSON.parse(shelljs.cat(path.join(pkg.fullPath, 'package.json')).stdout);
      const res = maybeMerge(_.cloneDeep(packageJson), overrides);

      if (isSave) {
        fs.writeFileSync(path.join(pkg.fullPath, 'package.json'), JSON.stringify(res, null, 2));
      }

      return diff(packageJson, res);
    };

    return pkg;
  });

  return {modules}
};

function toPackagePaths(changedPackages) {
  return new Set(changedPackages.map(el => el.relativePath));
}