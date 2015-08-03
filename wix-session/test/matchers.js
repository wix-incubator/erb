
module.exports = function (chai) {

    chai.use(function (_chai, utils) {
        _chai.Assertion.addMethod('beError', function () {
            var object = utils.flag(this, 'object');
            new _chai.Assertion(object.isError).to.be.eql(true);
        })
    });

};

