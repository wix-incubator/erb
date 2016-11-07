module.exports = class DeathRow {
  constructor() {
    this._row = {};
  }

  add(id) {
    this._row[id.toString()] = 'not-important';
  }

  remove(id) {
    const contains = this._row[id.toString()] !== undefined;
    delete this._row[id.toString()];
    return contains;
  }
};