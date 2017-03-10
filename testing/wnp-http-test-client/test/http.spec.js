const expect = require('chai').use(require('chai-as-promised')).expect,
  http = require('..'),
  testkit = require('wix-http-testkit');

describe('http client', function () {
  const server = aServer().beforeAndAfter();

  it('should do a http get by default', () =>
    http(server.getUrl('/ok')).then(res =>
      expect(res.ok).to.equal(true))
  );

  ['Get', 'Post', 'Put', 'Delete'].forEach(method => {
    describe(`'ok${method}' shorthand functions`, () => {

      it('should return fulfilled promise with res and res.ok for a 2xx responses', () =>
        http['ok' + method](server.getUrl('/ok')).then(res =>
          expect(res.ok).to.equal(true))
      );

      it('should return rejected promise with res and !res.ok for a non-2xx responses', () =>
        expect(http['ok' + method](server.getUrl('/not-ok'))).to.eventually.be.rejected
      );

      it('should expose .text() function on res on fulfilled promise', () =>
        http['ok' + method](server.getUrl('/ok-text')).then(res =>
          expect(res.text()).to.equal('ok'))
      );

      it('should expose .json() function on res on fulfilled promise', () =>
        http['ok' + method](server.getUrl('/ok-json')).then(res =>
          expect(res.json()).to.deep.equal({value: 'ok'}))
      );
    });
  });

  ['get', 'post', 'put', 'delete'].forEach(method => {
    describe(`'${method}' functions`, () => {

      it('should return fulfilled promise with res and res.ok for 2xx responses', () =>
        http[method](server.getUrl('/ok')).then(res =>
          expect(res.ok).to.equal(true))
      );

      it('should return fulfilled promise with res and !res.ok for non-2xx responses', () =>
        http[method](server.getUrl('/not-ok')).then(res =>
          expect(res.ok).to.equal(false))
      );

      it('should expose .text() function on res on fulfilled promise', () =>
        http[method](server.getUrl('/ok-text')).then(res =>
          expect(res.text()).to.equal('ok'))
      );

      it('should expose .json() function on res on fulfilled promise', () =>
        http[method](server.getUrl('/ok-json')).then(res =>
          expect(res.json()).to.deep.equal({value: 'ok'}))
      );

    });
  });

  function aServer() {
    const server = testkit.server();
    server.getApp()
      .all('/ok', (req, res) => res.end())
      .all('/ok-text', (req, res) => res.send('ok'))
      .all('/ok-json', (req, res) => res.json({value: 'ok'}))
      .all('/not-ok', (req, res) => res.status(500).end());

    return server;
  }
});
