const artifactVersion = require('./lib/artifact-version'),
  artifactName = require('./lib/artifact-name'),
  {fileReader} = require('./lib/read-file'),
  assert = require('assert');

module.exports = (cwd, log) => {
  assert(cwd && typeof cwd === 'string', 'cwd is mandatory and must be a string');
  assert(log, 'log is mandatory');
  const readFile = fileReader(cwd);
  const version = artifactVersion(readFile, log);
  const {groupId, artifactId} = artifactName(readFile);

  return {
    namespace: groupId,
    name: artifactId,
    version
  }
};
