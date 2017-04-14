const HeapDumpsGenerator = require('../lib/heap-dumper'),
  expect = require('chai').use(require('chai-as-promised')).expect;

describe('heap dumper', () => {
  const generator = new HeapDumpsGenerator();

  it('generates heap dump snapshot', () => {
    return generator.takeSnapshot('someId')
      .then(snapshot => {
        expect(snapshot).to.be.ok;
        expect(snapshot.export).to.be.a('Function');
        expect(snapshot.delete).to.be.a('Function');
      });
  });

  it('can generates id based on timestamp', () => {
    expect(generator.generateResourceId(42)).to.eq('42');
  });

  it('can generate and deserialize ids', () => {
    const date = new Date(Date.UTC(2017, 0, 1));
    const id = generator.generateResourceId(date.getTime());
    expect(generator.deserializeResourceFromId(id)).to.deep.eq({date});
  });
});
