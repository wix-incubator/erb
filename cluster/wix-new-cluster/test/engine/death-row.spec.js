const expect = require('chai').expect,
  DeathRow = require('../../lib/engine/death-row');

describe('death-row', () => {

  it('should add/remove items', () => {
    const deathRow = new DeathRow();
    deathRow.add(1);
    expect(deathRow.remove(1)).to.equal(true);
    expect(deathRow.remove(1)).to.equal(false);
  });

  it('should remove false when removing non-existent item', () => {
    const deathRow = new DeathRow();
    expect(deathRow.remove(1)).to.equal(false);
  });

  it('should convert ids to ints', () => {
    const deathRow = new DeathRow();
    deathRow.add('1');
    expect(deathRow.remove(1)).to.equal(true);

    deathRow.add(2);
    expect(deathRow.remove('2')).to.equal(true);
  });

});