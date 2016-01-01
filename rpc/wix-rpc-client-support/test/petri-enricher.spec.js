'use strict';
const chai = require('chai'),
  expect = chai.expect,
  petriDriver = require('./drivers/petri-driver'),
  petriContextRpcSupport = require('../lib/enrichers/petri-enricher');

describe('petri context', () => {


  const petriCookieName = '_wixAB3';
  const userIdPetriCookie = '_wixAB3|userId';

  var wixPetri;

  before(() => {
    wixPetri = petriDriver.mock();
  });


  it('copy petri context', ()=> {
    var petriCookies = {};
    petriCookies[petriCookieName] = 'some-anon-cookie';
    petriCookies[userIdPetriCookie] = 'some-user-petri-cookie';
    wixPetri.set(petriCookies);

    var headers = {};

    petriContextRpcSupport.get(wixPetri)(headers);

    expect(headers).to.have.property('X-Wix-Petri-Anon-RPC', 'some-anon-cookie');
    expect(headers).to.have.property('X-Wix-Petri-Users-RPC-userId', 'some-user-petri-cookie');
  });

  it('empty petri context', ()=> {
    wixPetri.set({});

    var headers = {};
    petriContextRpcSupport.get(wixPetri)(headers);

    expect(headers).to.deep.equal({});
  });


});