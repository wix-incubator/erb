const expect = require('chai').expect,
  resolve = require('../lib/resolvers/request-id').resolve;

describe('request-id resolver', () => {

  it('should resolve request id from "x-wix-request-id" header', () =>
    expect(resolve({'x-wix-request-id': '123'}, {})).to.equal('123'));

  it('should resolve request id from "request_id" header', () =>
    expect(resolve({}, {'request_id': '123'})).to.equal('123'));

  it('should generate request id if none is present in headers', () =>
    expect(resolve({}, {})).to.match(
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/));
});

