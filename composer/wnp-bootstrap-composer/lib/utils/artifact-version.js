const fs = require('fs'),
  join = require('path').join;

module.exports = (cwd, log) => {
  const versionFile = join(cwd, 'ver');
  try {
    return fs.readFileSync(join(cwd, 'ver')).toString();
  } catch (e) {
    log.debug(`version file '${versionFile}' not found, will not load artifact version`);
  }

  return '-';
};
