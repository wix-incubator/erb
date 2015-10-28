'use strict';
module.exports = function (chai) {

  var validGuid = function (guid) {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(guid);
  };

  chai.use(function (_chai, utils) {
    _chai.Assertion.addMethod('beValidGuid', function () {
      this.assert(
        validGuid(this._obj),
        'expected #{this} to be a valid guid',
        'expected #{this} to not be a a valid guid'
      );
    });
  });

};
