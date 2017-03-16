const {expect} = require('chai'),
  {fileReader, FileReadFailedError} = require('../lib/read-file'),
  {withCleanWorkingDir, givenVersion} = require('./support');

describe('read-file', () => {
  const cwd = withCleanWorkingDir('file-reader');
  const readFile = fileReader(cwd); 

  it('should return file as string', () => {
    givenVersion(cwd, '1.1.1');

    expect(readFile('ver')).to.equal('1.1.1');
  });

  it('should throw `FileReadFailedError` if file does not exist', () => {
    expect(() => readFile('non-existent')).to.throw(FileReadFailedError);
  });

});
