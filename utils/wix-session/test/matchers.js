'use strict';
module.exports = function (chai) {

  chai.use(function (_chai, utils) {
    _chai.Assertion.addMethod('beError', function () {
      this.assert(
        this._obj.isError,
        'expected #{this} to be error',
        'expected #{this} to not be error'
      );
    });
  });

};

