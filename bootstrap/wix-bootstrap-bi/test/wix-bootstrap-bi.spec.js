'use strict';
const expect = require('chai').expect,
  bootstrapBi = require('..');

describe('wix-bootstrap-bi', () => {

  it ('should fail to create logger factory given no context is provided', () => {
    expect(() => bootstrapBi()).to.throw('context is mandatory');
  });

  it ('should fail to create logger factory given context does not contain app', () => {
    expect(() => bootstrapBi({})).to.throw('context.env is mandatory');
  });

  it ('should fail to create logger factory given context.env does not contain logDir', () => {
    expect(() => bootstrapBi({ env: {}, app: {}})).to.throw('context.env.logDir is not defined.');
  });

  it ('should fail to create logger factory given context.app does not contain artifactName', () => {
    expect(() => bootstrapBi({env: {logDir: './some'}, app: {}})).to.throw('context.app.artifactName is not defined.');
  });
});