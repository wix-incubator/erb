'use strict';
const expect = require('chai').expect,
  enrich = require('../../lib/request-hooks/wix-session').get();

describe('wix-session request hook', () => {

  it('should add session header', () =>{
    const headers = {};
    const context = {
      session: {
        cookie: {
          name: 'x-wix-session',
          value: 'some-token'
        }
      }
    };

    enrich(headers, {}, context);
    expect(headers).to.contain.property('X-Wix-Session', 'some-token');
  });

  it('should not add session header if session aspect is not present', () =>{
    var headers = {};
    enrich(headers, {}, {});
    expect(headers).to.not.have.property('X-Wix-Session');
  });

  it('should not have session header if session aspect is present but empty', () =>{
    var headers = {};
    enrich(headers, {}, {session: {}});
    expect(headers).to.not.have.property('X-Wix-Session');
  });
});
