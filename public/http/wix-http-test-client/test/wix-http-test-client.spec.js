'use strict';
const expect = require('chai').use(require('chai-as-promised')).expect,
  http = require('../lib/wix-http-test-client'),
  testkit = require('wix-http-testkit'),
  bodyParser = require('body-parser');

describe('http test client', function () {
  const methods = ['get', 'post', 'put', 'delete', 'options', 'patch'];
  const server = aServer().beforeAndAfter();
  const url = url => server.getUrl(url);

  describe('default headers', () => {
    ['post', 'put', 'patch'].forEach(method => {
      it(`should set content type json for ${method}`, () =>
        http[method](url('/echo-headers')).verify({
          body: body => expect(body.requestHeaders).to.include({ 'content-type': 'application/json' })
        })
      );

      it(`should allow override content type header for ${method}`, () =>
        http[method](url('/echo-headers'), { headers: { 'Content-Type': 'text/plain' } }).verify({
          body: body => expect(body.requestHeaders).to.include({ 'content-type': 'text/plain' })
        })
      );

      it('should execute with json payload', () =>
        http[method](url('/echo-json-payload'), { body: { name: 'John' } }).verify({
          status: 200,
          body: { name: 'John' }
        })
      );

      it('should execute with text payload', () =>
        http[method](url('/echo-text-payload'), { body: 'John', headers: { 'Content-Type': 'text/plain' }, }).verify({
          status: 200,
          body: 'John'
        })
      );
    });
  });

  methods.forEach(method => {
    describe(`${method}`, () => {

      it('should execute', () =>
        http[method](url('/ok')).verify({
          status: 200
        })
      );

      [200, 201, 230, 299].forEach(code => {
        it(`should execute successfully with status code ${code} from 2xx`, () => {
          return http[method](url(`/status/${code}`)).verify()
        });
      });

      it('should execute and fail with status code not in 2xx', () =>
        expect(http[method](url('/status/404')).verify()).to.eventually.be.rejected
      );

      it('should execute with header', () =>
        http[method](url('/echo-headers'), { headers: { 'Content-Type': 'application/json' } }).verify({
          status: 200,
          body: body => expect(body.requestHeaders).to.deep.include({ 'content-type': 'application/json' })
        })
      );

      it('should execute with multiple headers', () =>
        http[method](url('/echo-headers'), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache', h1: '1', h2: '2'
          }
        }).verify({
          status: 200,
          body: body => expect(body.requestHeaders).to.include({
            'content-type': 'application/json',
            'cache-control': 'no-cache', h1: '1', h2: '2'
          })
        })
      );
    });

    describe(`${method} with verification`, () => {
      it('should pass with defaults', () =>
        http[method](url('/ok')).verify()
      );

      it('should assert status code ignoring non json body', () =>
        http[method](url('/txt')).verify({
          status: 200
        })
      );

      it('should assert status code function', () =>
        http[method](url('/ok')).verify({
          status: code => expect(code).to.equal(200)
        })
      );

      it('should assert response body', () =>
        http[method](url('/ok')).verify({
          body: 'ok'
        })
      );

      it('should assert response body function', () =>
        http[method](url('/ok')).verify({
          body: body => expect(body).to.equal('ok')
        })
      );

      it('should assert includes response headers', () =>
        http[method](url('/ok')).verify({
          headers: { 'Custom-Header-Color': 'Green' }
        })
      );

      it('should assert response headers function', () =>
        http[method](url('/ok')).verify({
          status: 200,
          body: 'ok',
          headers: headers => expect(headers.get('custom-header-color')).to.deep.equal('Green')
        })
      );

      it('should assert status, body and headers', () =>
        http[method](url('/ok')).verify({
          status: 200,
          body: 'ok',
          headers: headers => expect(headers.get('custom-header-color')).to.deep.equal('Green')
        })
      );

      it('should return node-fetch promise with resolved text and json', () =>
        http[method](url('/ok')).then(resp => {
          expect(resp.status).be.equal(200);
          expect(resp.statusText).be.equal('OK');
          expect(resp.ok).be.equal(true);
          expect(resp.json()).be.deep.equal('ok');
          expect(resp.text()).be.deep.equal('"ok"');
          expect(Object.keys(resp.headers.raw()).length).to.deep.equal(7);
          expect(resp.headers.get('Custom-Header-Color')).to.equal('Green');
        })
      );

      it('should allow using verify and node-fetch promise with resolved text and json', () =>
        http[method](url('/ok')).verify({ status: 200 }).then(resp => {
          expect(resp.json()).be.deep.equal('ok');
        })
      );
    });

  });

  function aServer() {
    const server = testkit.server();
    const app = server.getApp();
    app.use(bodyParser.json(), bodyParser.text());

    methods.forEach(method => {
      app[method]('/txt', (req, res) => {
        res.send('ok')
      });

      app[method]('/ok', (req, res) => {
        res.set('Custom-Header-Color', 'Green');
        res.json('ok')
      });

      app[method]('/echo-headers', (req, res) => {
        res.json({ requestHeaders: req.headers })
      });

      app[method]('/echo-json-payload', (req, res) => {
        res.json(req.body)
      });

      app[method]('/echo-text-payload', (req, res) => {
        res.send(req.body)
      });

      app[method]('/status/:code', (req, res) => {
        res.status(req.params.code).end()
      });
    });

    return server;
  }
});