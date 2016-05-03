'use strict';
require('debug').enable('wnp:*');

const writer = require('..'),
  expect = require('chai').expect,
  shelljs = require('shelljs'),
  join = require('path').join,
  strftime = require('strftime'),
  testkit = require('wix-stdouterr-testkit');

describe('wnp rolling file writer', () => {
  let tempDir;
  const interceptor = testkit.interceptor().beforeAndAfterEach();

  beforeEach(() => {
    shelljs.rm('-rf', tempDir);
    tempDir = `./target/log-${Date.now()}-${process.hrtime()[1]}`;
    shelljs.mkdir('-p', tempDir);
  });

  it('should pre-create directory given it does not exist', () => {
    const nonExistentLogDir = './target/does-not-exist';
    shelljs.rm('-rf', nonExistentLogDir);

    expect(shelljs.test('-d', nonExistentLogDir)).to.be.false;
    writer(nonExistentLogDir, {prefix: 'wix.test'});
    expect(shelljs.test('-d', nonExistentLogDir)).to.be.true;
    expect(interceptor.all).to.be.string(`Log folder: '${nonExistentLogDir}' does not exist. Creating...`);
  });

  it('should fail given log directory is not an actual directory', () => {
    const notAFolder = './index.js';
    expect(() => writer(notAFolder, {prefix: 'wix.test'})).to.throw(`Cannot create logger: '${notAFolder}' is not a folder.`);
  });


  it('should create a file matching "PREFIX.YYYY-MM-DD-HHMMSS.N.log"', done => {
    const file = writer(tempDir, {prefix: 'wix.test'});

    file.write('', () => {
      expect(resolveLogFile(tempDir, 'wix.test')).to.be.string(`wix.test.${strftime('%F')}`);
      done();
    });
  });

  it('should write to log file in utf-8', done => {
    const file = writer(tempDir, {prefix: 'wix.another'});

    file.write('ვეპხის ტყაოს', () => {
      file.write('ᚠᛇᚻ᛫ᛒᛦᚦ᛫ᚠᚱ', () => {
        expect(shelljs.cat(resolveLogFile(tempDir, 'wix.another'))).to.equal('ვეპხის ტყაოს\nᚠᛇᚻ᛫ᛒᛦᚦ᛫ᚠᚱ\n');
        done();
      });
    });
  });
});

function resolveLogFile(dir, pattern) {
  const logFiles = shelljs.ls(join(dir, pattern) + '*');
  expect(logFiles.length).to.equal(1);
  return logFiles.pop();
}