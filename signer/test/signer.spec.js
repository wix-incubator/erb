'use strict';
var chai = require('chai');
var expect = chai.expect;
var Signer = require('..');
var key = '1234567890123456';
var signer = new Signer(key);


var text = 'hi, I am going to be signed';
var anotherText = 'hi, i am another text';

describe('signer', function () {
  it('sign string with HmacSHA1', function () {
    expect(signer.sign(text)).to.equal('e9fe8a2f598bf3831bff2a62abbdbe200edcc7bb');
  });
  it('sign buffer with HmacSHA1', function () {
    expect(signer.sign(new Buffer(text))).to.equal('e9fe8a2f598bf3831bff2a62abbdbe200edcc7bb');
  });
  it('sign array of strings', function () {
    expect(signer.sign([text, anotherText])).to.equal('df092169db51efdb3f707f89ae1a4ffaaf83077b');
  });
  it('sign array of buffers', function () {
    expect(signer.sign([new Buffer(text), new Buffer(anotherText)])).to.equal('df092169db51efdb3f707f89ae1a4ffaaf83077b');
  });
});
