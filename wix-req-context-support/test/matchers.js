module.exports = function (chai) {

  chai.use(function (_chai, utils) {
    _chai.Assertion.addMethod('haveSignature', function (sig, time) {
      var object = utils.flag(this, 'object');
      this.assert(
        object['X-Wix-Signature'] === sig + ';' + time,
        'expected #{this} to have signature header',
        'expected #{this} to not have signature header'
      );
    });
  });

};

