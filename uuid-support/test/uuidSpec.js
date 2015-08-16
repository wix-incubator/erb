var uuidGenerator = require('../index');
var expect = require('chai').expect;
var _ = require('lodash');
require('./guidMatchers')(require('chai'));


describe("uuid", function(){
  
  it("uuid genetator", function(){
    expect(uuidGenerator.generate()).to.beValidGuid();
  });
  it("generate 100 uuids and they should be unique", function(){
    var uuids = [];
    for(var i=0; i< 100; i++)
      uuids.push(uuidGenerator.generate());

    expect(_.uniq(uuids, true).length).to.equal(100);

  });
});