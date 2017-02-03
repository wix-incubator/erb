const expect = require('chai').expect,
  { requireLogin } = require('..');

describe('No handler provided for requireLogin', () => {
  it('Fails with a descriptive message when no handler is provided', () => {
    expect(requireLogin).to.throw('AssertionError: No handler was provided');
  });
});