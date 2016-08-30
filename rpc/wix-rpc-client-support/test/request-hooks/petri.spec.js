'use strict';
const expect = require('chai').expect,
  enrich = require('../../lib/request-hooks/petri').get();

describe('petri request hook', () => {

  it('should copy petri context', () => {
    const headers = {};
    const context = {
      petri: {
        cookies: {
          '_wixAB3': 'some-anon-cookie',
          '_wixAB3|userId': 'some-user-petri-cookie'
        }, overrides: {
          'someSpec': 'someVal',
          'anotherSpec': 'anotherVal'
        }
      }
    };

    enrich(headers, {}, context);

    expect(headers).to.have.property('X-Wix-Petri-Anon-RPC', 'some-anon-cookie');
    expect(headers).to.have.property('X-Wix-Petri-Users-RPC-userId', 'some-user-petri-cookie');
    expect(headers).to.have.property('x-wix-petri-ex', 'someSpec:someVal;anotherSpec:anotherVal');
  });

  it('should be safe to not provide petri context', () => {
    const headers = {};
    enrich(headers, {}, {});

    expect(headers).to.deep.equal({});
  });

  it('should be safe to provide empty petri context', () => {
    const headers = {};
    enrich(headers, {}, {petri: {}});

    expect(headers).to.deep.equal({});
  });

});