'use strict';
const chai = require('chai'),
  expect = chai.expect,
  wixSessionEnricher = require('../lib/enrichers/wix-session-enricher');

describe('wix session enricher', () => {

  it('should not have x-wix-session because session not exist', () =>{
    var headers = {};
    wixSessionEnricher.get(aWixSessionWith())(headers);
    expect(headers).to.not.have.property('X-Wix-Session');
  });
  it('should not have x-wix-session because session exists but not token', () =>{
    var headers = {};
    wixSessionEnricher.get(aWixSessionWith({}))(headers);
    expect(headers).to.not.have.property('X-Wix-Session');
  });
  it('should have x-wix-session because session and token exists', () =>{
    var headers = {};
    wixSessionEnricher.get(aWixSessionWith({token: 'some-token'}))(headers);
    expect(headers).to.have.property('X-Wix-Session', 'some-token');
  });

  var aWixSessionWith = (toReturn) =>{
    return {
      get: ()=> {return toReturn;}
    };
  };
});
