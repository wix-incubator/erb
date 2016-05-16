'use strict';
const Composer = require('..').Composer,
  expect = require('chai').use(require('chai-as-promised')).expect,
  fetch = require('node-fetch');

describe('wix bootstrap composer stopping', function () {
  this.timeout(10000);

  it('should return a function that upon invocation stops http servers', () =>
    new Composer()
      .start()
      .then(stoppable =>
        Promise.all([fetch('http://localhost:3000/health/is_alive'), fetch('http://localhost:3004/health/deployment/test')])
          .then(() => stoppable())
          .then(() => {
            expect(fetch('http://localhost:3000/health/is_alive')).to.be.rejected;
            expect(fetch('http://localhost:3000/health/deployment/test')).to.be.rejected;
          })
      )
  );
});