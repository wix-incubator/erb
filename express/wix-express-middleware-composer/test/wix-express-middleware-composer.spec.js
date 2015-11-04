'use strict';
const expect = require('chai').expect,
  compose = require('..'),
  _ = require('lodash');

describe('wix express middleware composer', () => {

  it('should support one middleware', () => {
    const results = run(compose(aMiddleware(1)));

    expect(results).to.deep.equal(['m1/before', 'm1/after']);
  });

  it('should support multiple middleware', () => {
    const results = run(compose(aMiddleware(1), aMiddleware(2), aMiddleware(3)));

    expect(results).to.deep.equal(['m1/before', 'm2/before', 'm3/before', 'm3/after', 'm2/after', 'm1/after']);
  });

  it('should support array of middlewares', () => {
    const results = run(compose([aMiddleware(1), aMiddleware(2), aMiddleware(3)]));

    expect(results).to.deep.equal(['m1/before', 'm2/before', 'm3/before', 'm3/after', 'm2/after', 'm1/after']);
  });


  function run(composite) {
    let results = [];
    composite({}, {results}, _.identity);
    return results;
  }

  function aMiddleware(index) {
    return (req, res, next) => {
      res.results.push(`m${index}/before`);
      next();
      res.results.push(`m${index}/after`);
    };
  }
});