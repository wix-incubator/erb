module.exports = chai => {
  chai.Assertion.addMethod('signature', signature);

  function signature(sig, time) {
    this.assert(
      this._obj['X-Wix-Signature'] === sig + ';' + time,
      'expected #{this} to have signature header',
      'expected #{this} to not have signature header'
    );
  }
};

