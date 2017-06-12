const expect = require('chai').use(require('sinon-chai')).expect,
  Logger = require('wnp-debug').Logger,
  sinon = require('sinon'),
  log = sinon.createStubInstance(Logger),
  enrich = require('../../lib/request-hooks/gatekeeper').get(log);


describe('gatekeeper request hook', () => {

  it('does nothing if no gatekeeper context found', () => {
    const headers = enrichAndGetHeaders({});

    expect(headers).to.be.deep.equal({});
    expect(log.error).to.have.been.calledWithMatch(/gatekeeper/);
  });

  it('adds headers for unauthorized context', () => {
    const headers = enrichAndGetHeaders({
      gatekeeper: {
        authorized: false
      }
    });

    expect(headers).to.have.property('X-Wix-Auth-AlreadyVerified', 'false');
    expect(headers).not.to.have.property('X-Wix-Auth-Ctx');
  });

  it('adds headers for authorized context', () => {
    const authorizationContext = {
      'loggedInUser': 'guid1',
      'ownerId': 'guid2',
      'roles': ['role1', 'role2']
    };
    const headers = enrichAndGetHeaders({
      gatekeeper: {
        authorized: true,
        context: authorizationContext
      }
    });

    expect(headers).to.have.property('X-Wix-Auth-AlreadyVerified', 'true');
    expect(headers).to.have.property('X-Wix-Auth-Ctx', JSON.stringify(authorizationContext));
  });


  function enrichAndGetHeaders(ctx) {
    const headers = {};
    enrich(headers, {}, ctx);
    return headers;
  }
});
