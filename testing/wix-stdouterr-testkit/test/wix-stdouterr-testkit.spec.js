const expect = require('chai').expect,
  testkit = require('..'),
  intercept = require('intercept-stdout');

describe('wix-stdouterr-testkit', () => {

  [{prop: 'stdout', log: console.info}, {prop: 'stderr', log: console.error}].forEach(el => {
    it(`should intercept ${el.prop} within start/stop bounds`, () => {
      const std = testkit.interceptor();
      el.log('not intecepted');
      return std.start()
        .then(() => el.log('intercepted'))
        .then(() => std.stop())
        .then(() => el.log('not intercepted any more'))
        .then(() => expect(std[el.prop]).to.equal('intercepted\n'));
    });

    it(`should reset ${el.prop} on subsequent start`, () => {
      const std = testkit.interceptor();
      return std.start()
        .then(() => el.log('intercepted'))
        .then(() => std.stop())
        .then(() => expect(std[el.prop]).to.equal('intercepted\n'))
        .then(() => std.start())
        .then(() => el.log('intercepted'))
        .then(() => std.stop())
        .then(() => expect(std[el.prop]).to.equal('intercepted\n'));
    });
  });

  it('should allow to get combined stdout/stderr output', () => {
    const std = testkit.interceptor();
    return std.start()
      .then(() => {
        console.info('info');
        console.error('error');
      })
      .then(() => std.stop())
      .then(() => expect(std.output).to.equal('info\nerror\n'));
  });

  it('should capture output, but not swallow it', () => {
    return withInnerOuter(() => {
      console.info('info');
      console.error('error');
    }).then(({testkitOutput, outerOutput}) => {
      expect(testkitOutput).to.equal('info\nerror\n');
      expect(outerOutput).to.equal('info\nerror\n');
    });

  });

  it('should not forward aggregate output to stdout', () => {
    return withInnerOuter(() => {
      console.info('info');
      console.info('info');
    }).then(({testkitOutput, outerOutput}) => {
      expect(testkitOutput).to.equal('info\ninfo\n');
      expect(outerOutput).to.equal('info\ninfo\n');
    });
  });

  it('should not forward aggregate output to stderr', () => {
    return withInnerOuter(() => {
      console.error('err');
      console.error('err');
    }).then(({testkitOutput, outerOutput}) => {
      expect(testkitOutput).to.equal('err\nerr\n');
      expect(outerOutput).to.equal('err\nerr\n');
    });

  });

  function withInnerOuter(cb) {
    let outerOutput = '';
    const detachOuter = intercept(stdouterr => {
      outerOutput += stdouterr;
    });
    const innerInterceptor = testkit.interceptor();

    return innerInterceptor.start()
      .then(cb)
      .then(() => innerInterceptor.stop())
      .then(() => detachOuter())
      .then(() => {
        return {
          testkitOutput: innerInterceptor.output,
          outerOutput
        };
      });
  }
});
