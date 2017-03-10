const expect = require('chai').expect,
  enrich = require('../../lib/request-hooks/bi').get();

describe('bi request hook', () => {

  it('should add both client id and global session id', () => {
    let headers = {};
    var ctx = {
      bi: {
        clientId: 'cidx123',
        globalSessionId: 'globalSessionId123'
      }
    };
    enrich(headers, {}, ctx);
    expect(headers).to.have.property('X-Wix-Client-Global-Session-Id', 'globalSessionId123');
    expect(headers).to.have.property('X-Wix-Client-Id', 'cidx123');
  });

  it('should be noop given bi aspect is not provided', () => {
    let headers = {};
    enrich(headers, {}, {});
    expect(headers).to.deep.equal({});
  });

  it('should be noop given bi aspect is empty', () => {
    let headers = {};
    enrich(headers, {}, {bi: {}});

    expect(headers).to.deep.equal({});
  });

});
