'use strict';
const expect = require('chai').use(require('chai-as-promised')).expect,
  testkit = require('./support/testkit'),
  eventually = require('wix-eventually');

describe('wix cluster', function () {
  this.timeout(30000);
  let app = testkit.server('defaults');

  afterEach(() => app && app.stop().catch(() => {
  }));

  it('should gracefully stop workers and exit process on sigterm', () =>
    app.start()
      .then(() => app.kill('SIGTERM'))
      .then(() => eventually(() => expect(app.output()).to.be.string('app closed function called')))
      .then(() => eventually(() => expect(app.isRunning()).to.equal(false)))
  );
});
