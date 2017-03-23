const testkit = require('wix-stdouterr-testkit'),
  expect = require('chai').expect;

describe('wnp debug', () => {
  const interceptor = testkit.interceptor().beforeAndAfterEach();

  it('should fail of log key is not provided', () => {
    withDebug(requireDebug => {
      const debug = requireDebug();
      expect(() => debug()).to.throw('Name must be provided');
    });
  });

  it('should fail of log key is empty string', () => {
    withDebug(requireDebug => {
      const debug = requireDebug();
      expect(() => debug('')).to.throw('Name must be provided');
    });

  });

  ['debug', 'info', 'error'].forEach(level => {
    describe(level, () => {
      const log = (debug, key) => function () {
        const logger = debug(key);
        logger[level].apply(logger, Array.from(arguments));
      };

      it(`should log ${level} to stderr with prefix`, () => {
        withDebug((requireDebug, setEnv) => {
          setEnv('wix:*');
          log(requireDebug(), 'debug')('log entry');

          expect(interceptor.stderr).to.match(new RegExp(`wix:${level}:debug.*log entry`));
        });
      });

      it(`should normalize log key for ${level} level`, () => {
        withDebug((requireDebug, setEnv) => {
          setEnv('wix:*');
          log(requireDebug(), 'wix-debug')('error log');

          expect(interceptor.stderr).to.match(new RegExp(`wix:${level}:debug.*error log`));
        });
      });

      it(`should log with level ${level} with stack-trace`, () => {
        withDebug((requireDebug, setEnv) => {
          setEnv('wix:*');
          log(requireDebug(), 'wix-debug')(new Error('woops'));

          expect(interceptor.stderr).to.match(new RegExp(`wix:${level}:debug.*Error: woops(.*?(\n))+.*at.Context`));
        });
      });

      it(`should coerce error object ${level} that is in a list of arguments with stack-trace`, () => {
        withDebug((requireDebug, setEnv) => {
          setEnv('wix:*');
          log(requireDebug(), 'wix-debug')('message', new Error('woops as arg'));

          expect(interceptor.stderr).to.match(new RegExp(`wix:${level}:debug.*Error: woops as arg(.*?(\n))+.*at.Context`));
        });
      });
    });
  });

  it('should enable wix:error:* without env variable set', () => {
    withDebug(requireDebug => {
      const debug = requireDebug();

      debug('ok').info('info log');
      debug('ok').error('error log');

      expect(interceptor.stderr).to.not.match(/wix:info:ok.*info log/);
      expect(interceptor.stderr).to.match(/wix:error:ok.*error log/);
    });
  });

  it('should not interfere with existing DEBUG env variable namespaces', () => {
    withDebug((requireDebug, setEnv) => {
      setEnv('wix:info:boo');
      const debug = requireDebug();

      debug('boo').info('info log');
      debug('ok').error('error log');

      expect(interceptor.stderr).to.match(/wix:info:boo.*info log/);
      expect(interceptor.stderr).to.match(/wix:error:ok.*error log/);
    });
  });

  it('should not override disables', () => {
    withDebug((requireDebug, setEnv) => {
      setEnv('-wix:*');
      const debug = requireDebug();
      
      debug('ok').error('error log');
      
      expect(interceptor.stderr).to.not.match(/wix:error:ok.*error log/);
    });
  });

  function withDebug(cb) {
    const debugEnvBefore = process.env['DEBUG'];
    const setEnv = envValue => process.env['DEBUG'] = envValue;
    const requireDebug = () => require('..');

    try {
      delete process.env['DEBUG'];
      delete require.cache[require.resolve('..')];
      cb(requireDebug, setEnv);
    } finally {
      delete require.cache[require.resolve('..')];
      process.env['DEBUG'] = debugEnvBefore;
    }
  };
});
