const log = require('./logger')(),
  assert = require('./asserts'),
  octopus = require('./octopus'),
  findProjectRoot = require('./project-root'),
  config = require('./config');

module.exports.forCommand = (nameFn, fn) => {
  return argv => {
    const projectRoot = findProjectRoot(process.cwd());
    assert.assertGitRepo(projectRoot, log);

    const name = typeof nameFn === "function" ? nameFn(argv) : nameFn;
    log.exec(name, () => {
      const conf = config(projectRoot);
      fn(octopus({cwd: projectRoot, excludes: conf.exclude}), conf, argv);
    });
  };
};
