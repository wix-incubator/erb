const expect = require('chai').expect,
  {requireLogin} = require('..');

describe('requireLogin call without handler provided', () => {

  it('fails with a descriptive message when no handler is provided', () => {
    expect(requireLogin).to.throw('AssertionError: No handler was provided');
  });
});
