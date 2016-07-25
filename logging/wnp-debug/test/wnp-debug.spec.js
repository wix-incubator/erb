'use strict';
const debug = require('..'),
  testkit = require('wix-stdouterr-testkit'),
  expect = require('chai').expect;

describe('wnp debug', () => {
  const interceptor = testkit.interceptor().beforeAndAfterEach();

  it('should fail of log key is not provided', () => {
    expect(() => debug()).to.throw('Name must be provided');
  });

  it('should fail of log key is empty string', () => {
    expect(() => debug('')).to.throw('Name must be provided');
  });

  ['debug', 'info', 'error'].forEach(level => {
    describe(level, () => {
      const log = key => function () {
        const logger = debug(key);
        logger[level].apply(logger, Array.from(arguments));
      };

      it(`should log ${level} to stderr with prefix`, () => {
        log('debug')('log entry');

        expect(interceptor.stderr).to.be.string(`wnp:${level}:debug`);
        expect(interceptor.stderr).to.be.string('log entry');
      });

      it(`should normalize log key for ${level} level`, () => {
        log('wix-debug')('error log');

        expect(interceptor.stderr).to.be.string(`wix:${level}:debug`);
      });

      it(`should log with level ${level} with stack-trace`, () => {
        log('wix-debug')(new Error('woops'));

        expect(interceptor.stderr).to.be.string(`wix:${level}:debug`);
        expect(interceptor.stderr).to.be.string('Error: woops');
        expect(interceptor.stderr).to.be.string('at Context.');
      });

      it(`should coerce error object ${level} that is in a list of arguments with stack-trace`, () => {
        log('wix-debug')('message', new Error('woops as arg'));

        expect(interceptor.stderr).to.be.string(`wix:${level}:debug`);
        expect(interceptor.stderr).to.be.string('Error: woops as arg');
        expect(interceptor.stderr).to.be.string('at Context.');
      });


    });
  });
});