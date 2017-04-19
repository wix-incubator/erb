const {expect} = require('chai'),
  enrich = require('../../lib/request-hooks/wix-session').get();

describe('wix-session request hook', () => {

  it('should add session header for wixSession', () => {
    const headers = {};
    const context = {
      session: {
        cookies: {
          'wixSession': 'some-token'
        }
      }
    };

    enrich(headers, {}, context);
    expect(headers).to.contain.property('X-Wix-Session', 'some-token');
  });

  it('should add session header for wixSession2', () => {
    const headers = {};
    const context = {
      session: {
        cookies: {
          'wixSession2': 'some-token'
        }
      }
    };

    enrich(headers, {}, context);
    expect(headers).to.contain.property('X-Wix-Session2', 'some-token');
  });


  it('should not add session header if session aspect is not present', () => {
    const headers = {};
    enrich(headers, {}, {});
    expect(headers).to.not.have.property('X-Wix-Session');
    expect(headers).to.not.have.property('X-Wix-Session2');
  });

  it('should not have session header if session aspect is present but empty', () => {
    const headers = {};
    enrich(headers, {}, {session: {}});
    expect(headers).to.not.have.property('X-Wix-Session');
    expect(headers).to.not.have.property('X-Wix-Session2');
  });
});
