const http = require('..'),
  testkit = require('wix-http-testkit'),
  expect = require('chai').expect;

describe('example', () => {

  aServer().beforeAndAfter();

  // Accepts node-fetch options

  it('accepts node-fetch options', () =>
    http.post('http://localhost:3000/dogs', {
      json: { name: 'John' },
      headers: { 'Content-Type': 'application/json', 'Cookie': 'value1; name=Rock' }
    }).verify({
      status: 201
    })
  );

  // Functions for other methods

  it('has function for post', () =>
    http.post('http://localhost:3000/dogs', { json: { name: 'Rock' } }).verify({ status: 201 })
  );

  it('has function for delete', () =>
    http.delete('http://localhost:3000/dogs/1').verify({ status: 204 })
  );

  // Verify status code

  it('does a get request and expects response status code', () =>
    http.get('http://localhost:3000/dogs').verify({ status: 200 })
  );

  it('does a get request and uses function to verify status code', () =>
    http.get('http://localhost:3000/dogs').verify({ status: status => expect(status).to.be.within(200, 299) })
  );

  // Verify response body

  it('does a get request and expects JSON response body', () =>
    http.get('http://localhost:3000/dogs').verify({ json: [{ name: 'Apollo' }] })
  );

  it('does a get request and uses function to verify JSON response body', () =>
    http.get('http://localhost:3000/dogs').verify({ json: json => expect(json).to.deep.equal([{ name: 'Apollo' }]) })
  );

  // Verify response headers

  it('does a get request and expects response header to be present', () =>
    http.get('http://localhost:3000/dogs').verify({ headers: { 'Content-Type': 'application/json; charset=utf-8' } })
  );

  it('does a get request and uses function to verify response headers', () =>
    http.get('http://localhost:3000/dogs').verify({ headers: headers => expect(Object.keys(headers.raw()).length).to.equal(7) })
  );

  // Verify flatten promise returned from node-fetch

  it('does a get request and uses function to verify response headers', () =>
    http.get('http://localhost:3000/dogs').then(resp => {
      expect(resp.status).be.equal(200);
      expect(resp.statusText).be.equal('OK');
      expect(resp.ok).be.equal(true);
      expect(resp.json()).be.deep.equal([{ name: 'Apollo' }]);
      expect(resp.text()).be.deep.equal('[{"name":"Apollo"}]');
      expect(Object.keys(resp.headers.raw()).length).to.deep.equal(7);
      expect(resp.headers.get('Custom-Header-Color')).to.equal('Green');
    })
  );

  function aServer() {
    const server = testkit.server({ port: 3000 });
    const app = server.getApp();

    app.get('/dogs', (req, res) => {
      res.set('Custom-Header-Color', 'Green');
      res.json([{ name: 'Apollo' }])
    });

    app.post('/dogs', (req, res) => {
      res.status(201).json()
    });

    app.delete('/dogs/1', (req, res) => {
      res.status(204).json()
    });

    return server;
  }

});