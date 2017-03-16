const fs = require('fs'),
  join = require('path').join,
  {wixSystemError} = require('wix-errors');

function fileReader(cwd) {
  return name => {
    try {
      return fs.readFileSync(join(cwd, name)).toString();
    } catch (e) {
      throw new FileReadFailedError(name, e);
    }
  };
}

class FileReadFailedError extends wixSystemError() {
  constructor(name, cause) {
    super(`Failed reading file ${name}`, cause);
  }
}

module.exports.FileReadFailedError = FileReadFailedError;
module.exports.fileReader = fileReader;
