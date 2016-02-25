'use strict';
const chai = require('chai'),
  expect = chai.expect,
  petriResponseHook = require('../lib/response-hooks/petri-response-hook');

describe('petri response hook', () => {
  it('should not rewrite because there is no petri response cookies', () =>{
    const ctx = new PetriContext({cookies: {}});
    petriResponseHook.get(ctx)({cookies: {}});
  });
  it('should rewrite petri cookies to context because response have wixAB3 cookies', () =>{
    const ctx = new PetriContext({cookies: {}});
    petriResponseHook.get(ctx)({'set-cookie':['_wixAB3=v1; _wixAB3|1111=v2; nonRelevantCookie=v3']});
    expect(ctx.get().cookies).to.deep.equal({'_wixAB3': 'v1', '_wixAB3|1111' : 'v2'});
  });
  it('should not rewrite petri context because remote cookies are without petri', () => {
    const ctx = new PetriContext({cookies: {'_wixAB3': '77'}});
    petriResponseHook.get(ctx)({'set-cookie':['nonRelevantCookie1=v3; nonRelevantCookie1=v5']});
    expect(ctx.get().cookies).to.deep.equal({'_wixAB3': '77'});
  });
});


class PetriContext {
  constructor(ctx){
    this.ctx = ctx;
  }
  get(){
    return this.ctx;
  }

  set(petriCookies) {
    this.ctx = petriCookies;
  }
}
