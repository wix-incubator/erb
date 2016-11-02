'use strict';
const fs = require('fs'),
  join = require('path').join,
  log = require('wnp-debug')('bootstrap-composer');

module.exports = cwd => {
  const versionFile = join(cwd, 'ver');
  try {
    return fs.readFileSync(join(cwd, 'ver')).toString();
  } catch (e) {
    log.debug(`version file '${versionFile}' not found, will not load artifact version`);
  }

  return '-';
};