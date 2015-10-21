'use strict';
const expect = require('chai').expect;

exports.fakeClient = () => new FakeClient();

function FakeClient() {
  this.hooks = [];

  this.registerMetadataEnrichmentHook = injector => this.hooks.push(injector);

  this.apply = event => {
    expect(this.hooks.length).to.equal(1);
    return this.hooks[0](event);
  };
}
