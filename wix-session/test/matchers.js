
module.exports = function (chai) {

    chai.use(function (_chai, utils) {
        _chai.Assertion.addMethod('beError', function () {
            var object = utils.flag(this, 'object');
            new _chai.Assertion(object.isError).to.be.eql(true);
        });

        _chai.Assertion.addMethod('beError', function () {
            this.assert(
                this._obj.isError,
                'expected #{this} to be error',
                'expected #{this} to not be error'
            );
        });
    });

};

