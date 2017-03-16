const VERSION_FILE_NAME = 'ver';

module.exports = (readFile, log) => {

  try {
    return readFile(VERSION_FILE_NAME);
  } catch (e) {
    log.debug(`version file '${VERSION_FILE_NAME}' not found, will not load artifact version`);
  }

  return '-';
};
