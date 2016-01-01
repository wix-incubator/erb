'use strict';

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
  return petriMock;
};

