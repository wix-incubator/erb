'use strict';
const detect = require('../lib/detect-debug'),
  expect = require('chai').expect;

describe('detect-debug', () => {

  it('return true if "--debug" arg is set', () =>
    expect(detect(['--debug'])).to.equal(true));

  it('return true if "--debug-brk" arg is set', () =>
    expect(detect(['--debug-brk'])).to.equal(true));

  it('return true if "--debug-brk=8081" arg is set', () =>
    expect(detect(['--debug-brk=123123'])).to.equal(true));

  it('return true if "v8debug" is set arg is set', () =>
    expect(detect([], {})).to.equal(true));

  it('return true if neither debug argv nor global debug object is set', () =>
    expect(detect([])).to.equal(false));
});