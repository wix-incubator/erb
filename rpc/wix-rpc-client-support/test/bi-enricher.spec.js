'use strict';
const chai = require('chai'),
  expect = chai.expect,
  chance = require('chance')(),
  biContextEnricher = require('../lib/enrichers/bi-enricher');

describe('bi enricher', () => {


  it('should add both cidx and global session id', () => {
    let headers = {};
    var ctx = {
      cidx: chance.guid(),
      globalSessionId: chance.guid()
    };
    biContextEnricher.get(aBiWith(ctx))(headers);
    expect(headers).to.have.property('X-Wix-Client-Global-Session-Id', ctx.globalSessionId);
    expect(headers).to.have.property('X-Wix-Clien-Id', ctx.cidx);
  });

  it('should not add headers for empty cidx and global session id', () => {
    let headers = {};
    let ctx = {};
    biContextEnricher.get(aBiWith(ctx))(headers);
    expect(headers).to.not.have.property('X-Wix-Client-Global-Session-Id');
    expect(headers).to.not.have.property('X-Wix-Clien-Id');
  });


  var aBiWith = (toReturn) => {
    return {
      get: ()=> {
        return toReturn;
      }
    };
  };
});
