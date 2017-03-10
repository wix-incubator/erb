const expect = require('chai').expect,
  inject = require('../lib/injectors/seen-by').inject;

describe('seen-by injector', () => {

  it('should be a noop if no seenBy is present', () => {
    const res = {headers: {}};
    inject([], res);
    expect(res).to.deep.equal(res);
  });

  it('should write single seen-by value', () => {
    const res = {headers: {}};
    inject(['me'], res);
    expect(res).to.deep.equal({headers: {'X-Seen-By': 'me'}});
  });

  it('should write multiple seen-by values and remove duplicates', () => {
    const res = {headers: {}};
    inject(['me', 'too', 'me'], res);
    expect(res).to.deep.equal({headers: {'X-Seen-By': 'me,too'}});
  });
});
