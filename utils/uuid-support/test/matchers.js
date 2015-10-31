'use strict';
module.exports = chai => {
  chai.Assertion.addMethod('validGuid', validGuid);
};

function validGuid() {
  this.assert(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(this._obj),
    'expected #{this} to be a valid guid',
    'expected #{this} to not be a a valid guid',
    this._obj);
}