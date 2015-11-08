'use strict';
const mockery = require('mockery');

function WixPetriMock(){
  this.context = [];
}
WixPetriMock.prototype.set = function(o){
  this.context = o;
};

WixPetriMock.prototype.get = function(){
  return this.context;
};


exports.mock = () =>{
  let petriMock = new WixPetriMock();
  mockery.enable({warnOnReplace: false, warnOnUnregistered: false, useCleanCache: true});
  mockery.registerMock('wix-petri', petriMock);
  return petriMock;
};