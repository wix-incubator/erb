'use strict';
const writer = require('..'),
  expect = require('chai').expect,
  shelljs = require('shelljs'),
  join = require('path').join,
  strftime = require('strftime');

describe('wnp rolling file writer', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = `./target/log-${Date.now()}-${process.hrtime()[1]}`;
    shelljs.mkdir('-p', tempDir);
  });

  afterEach(() => shelljs.rm('-rf', tempDir));

  it('should create a file matching "PREFIX.YYYY-MM-DD-HHMMSS.N.log"', done => {
    const file = writer(tempDir, {prefix: 'wix.test'});

    file.write('', () => {
      expect(resolveLogFile(tempDir, 'wix.test')).to.be.string(`wix.test.${strftime('%F')}`);
      //expect(shelljs.cat(resolveLogFile(tempDir, 'wix.test'))).to.equal('boo');
      done();
    });
  });

  it('should write to log file in utf-8"', done => {
    const file = writer(tempDir, {prefix: 'wix.another'});

    file.write('ვეპხის ტყაოს', () => {
      file.write('ᚠᛇᚻ᛫ᛒᛦᚦ᛫ᚠᚱ', () => {
        expect(shelljs.cat(resolveLogFile(tempDir, 'wix.another'))).to.equal('ვეპხის ტყაოს\nᚠᛇᚻ᛫ᛒᛦᚦ᛫ᚠᚱ');
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