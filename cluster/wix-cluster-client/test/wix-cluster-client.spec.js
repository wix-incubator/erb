const expect = require('chai').expect,
  client = require('..'),
  testkit = require('wix-childprocess-testkit'),
  fetch = require('node-fetch'),
  eventually = require('wix-eventually').with({timeout: 5000});

describe('wix-cluster-client', function () {

  describe('non-clustered', () => {

    it('should return workerId as 1', () => {
      expect(client().workerId).to.equal(1);
    });

    it('should return process count as 1', () => {
      expect(client().workerCount).to.equal(1);
    });

    it('should return death count as "N/A"', () => {
      expect(client().deathCount).to.equal('N/A');
    });

    it('should allow to emit and consume messages', done => {
      const instance = client();

      instance.on('messageKey', msg => {
        expect(msg).to.deep.equal({value: 'aValue'});
        done();
      });

      instance.emit('messageKey', {value: 'aValue'});
    });
  });

  describe('clustered', () => {
    const app = testkit.fork('./test/app/wix-cluster-app', {env: {PORT: 3000}}, testkit.checks.httpGet('/'))
      .beforeAndAfterEach();

    it('should return workerId that matches worker.id', () =>
      fetch('http://localhost:3000/id')
        .then(res => res.json())
        .then(json => expect(json.id).to.equal(json.workerId))
    );


    retryingIt('should return worker count', () =>
      fetch('http://localhost:3000/stats')
        .then(res => res.json())
        .then(json => expect(json.workerCount).to.equal(1))
    );

    retryingIt('should return death count', () =>
      fetch('http://localhost:3000/die')
        .then(() => eventually(() =>
          fetch('http://localhost:3000/stats')
            .then(res => res.json())
            .then(json => expect(json.deathCount).to.equal(1)))
        )
    );

    it('should broadcast message to all workers', () =>
      fetch('http://localhost:3000/emit/aValue')
        .then(res => expect(res.status).to.equal(200))
        .then(() => eventually(() => {
          expect(app.output).to.be.string('worker-1 received event aKey with value aValue');
        }))
    );

  });
});

function retryingIt(name, cb) {
  it(name, () => eventually(cb));
}
