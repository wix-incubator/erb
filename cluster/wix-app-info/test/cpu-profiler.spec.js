const CpuProfilesGenerator = require('../lib/cpu-profiler'),
  expect = require('chai').use(require('chai-as-promised')).expect;

const duration = 100;

describe('heap dumper', () => {
  const generator = new CpuProfilesGenerator();

  it('generates heap dump snapshot', () => {
    return generator.takeSnapshot('someId', {duration})
      .then(snapshot => {
        expect(snapshot).to.be.ok;
        expect(snapshot.export).to.be.a('Function');
        expect(snapshot.delete).to.be.a('Function');
      });
  });

  it('can generates id based on timestamp and duration', () => {
    expect(generator.generateResourceId(42, {duration})).to.eq('42.100');
  });

  it('can generate and deserialize ids', () => {
    const date = new Date(Date.UTC(2017, 0, 1));
    const id = generator.generateResourceId(date.getTime(), {duration});
    expect(generator.deserializeResourceFromId(id)).to.deep.equal({date, duration});
  });
});
