'use strict';
const chai = require('chai'),
  expect = chai.expect,
  seenByResponseHook = require('../lib/response-hooks/seen-by-response-hook');

describe('response hook seen by', () =>{

  it('should not change context because response does not contains seen by header', () => {
    let reqContext = new WixRequestContext();
    seenByResponseHook.get(reqContext)({});
    expect(reqContext.ctx.seenBy).to.deep.equal(['seen-by-kfir']);
  });
  it('should not change context because seen by has empty array', () => {
    let reqContext = new WixRequestContext();
    seenByResponseHook.get(reqContext)({'x-seen-by': []});
    expect(reqContext.ctx.seenBy).to.deep.equal(['seen-by-kfir']);
  });
  it('should change context and concat seen by from remote server', () => {
    let reqContext = new WixRequestContext();
    seenByResponseHook.get(reqContext)({'x-seen-by': ['some-server.wix.com']});
    expect(reqContext.ctx.seenBy).to.deep.equal(['seen-by-kfir','some-server.wix.com']);
  });
  it('should change context and concat seen by from remote server and remote server have multiple values', () => {
    let reqContext = new WixRequestContext();
    seenByResponseHook.get(reqContext)({'x-seen-by': ['some-server.wix.com,someOtherServer.wix.com']});
    expect(reqContext.ctx.seenBy).to.deep.equal(['seen-by-kfir','some-server.wix.com', 'someOtherServer.wix.com']);
  });

});

class WixRequestContext {
  constructor(){
    this.ctx = { seenBy: ['seen-by-kfir'] };
  }
  get(){
    return this.ctx;
  }
}



