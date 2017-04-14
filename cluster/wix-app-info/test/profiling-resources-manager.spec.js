const ProfilingResourcesManager = require('../lib/profiling-resources-manager'),
  checkValidZip = require('./test-utils').checkValidZip,
  shelljs = require('shelljs'),
  path = require('path'),
  expect = require('chai').use(require('chai-as-promised')).expect;

class FakeSnapshot {
  constructor(content) {
    this._content = content;
  }

  export(fn) {
    fn(null, this._content);
  }

  delete() {}
}

class FakeGenerator {
  generateResourceId(timestamp) {
    return `${timestamp}`;
  }

  deserializeResourceFromId(id) {
    return { date: new Date(parseInt(id)) };
  }

  takeSnapshot(id) {
    return Promise.resolve(new FakeSnapshot(id));
  }

  resourceType() {
    return 'fake';
  }
}

class NonResolveableGenerator extends FakeGenerator {
  takeSnapshot() {
    return new Promise(() => null);
  }
}

describe('profiling resources manager', () => {
  const tmp = path.resolve('./target/unit-tmp/fakes'),
    manager = new ProfilingResourcesManager({ folder: tmp, resourceGenerator: new FakeGenerator() });

  beforeEach(() => {
    shelljs.rm('-rf', tmp);
    shelljs.mkdir('-p', tmp);
  });

  it('generates resources', () => {
    return manager.generate().then((resource) => {
      expect(resource.id).to.be.ok;
      expect(resource.status).to.equal('READY');
    });
  });

  it('return empty list when no resources are generated', () => {
    return manager.list().then((resources) => {
      expect(resources).to.be.empty;
    });
  });

  it('returns resources sorted by descending date', () => {
    return manager.generate().then((olderresource) => {
      return manager.generate().then((newerresource) => {
        return manager.list().then((resources) => {
          expect(resources).to.deep.eq([newerresource, olderresource]);
        });
      });
    });
  });

  it('return list of generated resources', () => {
    return manager.generate().then((resource) => {
      return manager.list().then((resources) => {
        expect(resources).to.deep.equal([resource]);
      });
    });
  });

  it('return list of pending resources', () => {
    const manager = new ProfilingResourcesManager({ folder: tmp, resourceGenerator: new NonResolveableGenerator() });
    manager.generate();

    return manager.list().then((resources) => {
      expect(resources.length).to.equal(1);
      expect(resources[0].id).to.be.ok;
      expect(resources[0].status).to.equal('PENDING');
    });
  });

  it('allows to download ready files', () => {
    return manager.generate().then((resource) => {
      return manager.get(resource.id).then((contents) => {
        expect(contents).to.not.be.empty;
      });
    })
  });

  it('fails to return pending or not existent resources', () => {
    return expect(manager.get('wrongId')).to.be.rejected;
  });

  it('returns zipped resources', () => {
    const date = new Date(Date.UTC(2017, 0, 1));
    return manager.generate({ now: date.getTime() })
      .then(resource => manager.get(resource.id))
      .then(contents => checkValidZip(contents, '2017-01-01T00-00-00.000Z.fake'));
  })
});
