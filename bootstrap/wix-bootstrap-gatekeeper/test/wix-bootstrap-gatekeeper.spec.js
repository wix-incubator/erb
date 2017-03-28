const expect = require('chai').use(require('sinon-chai')).expect,
  sinon = require('sinon'),
  middlewareFactory = require('../lib/wix-bootstrap-gatekeeper-middleware')

describe('bootsrap gatekeeper middleware', () => {

  it('calls next with undefined regardless what authorize returns', () => {

    const authResult = Promise.resolve('woop');

    return assertNextToBeCalledWith(authResult)(args => expect(args).to.be.undefined);
  });

  it('calls next with error when authorization fails', () => {

    const error = new Error('unauthorized');
    const authResult = Promise.reject(error);

    return assertNextToBeCalledWith(authResult)(args => expect(args).to.be.equal(error));
  });
});

const assertNextToBeCalledWith = (authResult) => (verify) => {
  const instance = aMiddlewareWithAuthorisationResult(authResult);
  return instance({}, {}, verify);
};

function aMiddlewareWithAuthorisationResult(authResult) {
  const authorize = sinon.stub().returns(authResult);
  const client = sinon.stub().returns({
    authorize: authorize
  });

  return middlewareFactory.middleware(client)({scope: 'aScope', action: 'anAction'})(() => 'metasiteId');
}
