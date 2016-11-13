const shelljs = require('shelljs'),
  path = require('path');

module.exports.assertGitRepo = (cwd, log) => {
  if (!shelljs.test('-d', path.join(cwd, '.git'))) {
    log.error('Must execute in root of git repo');
    process.exit(1);
  }
};

module.exports.assertOctopusProject = (cwd, log) => {
  if (!shelljs.test('-f', path.join(cwd, 'octopus.json'))) {
    log.error('Must be a octopus project (octopus.json not found in cwd)');
    process.exit(1);
  }
};
