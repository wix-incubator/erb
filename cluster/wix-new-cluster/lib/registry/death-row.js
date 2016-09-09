'use strict';

//TODO: clear dead items
class DeathRow {
  constructor(cluster) {
    this._deathRow = {};
    cluster.on('exit', worker => this.remove(worker.id));
  }

  add(id) {
    if (!this._deathRow[id + '']) {
      this._deathRow[id + ''] = 'waiting';
      return true;
    } else {
      return false;
    }
  }

  contains(id) {
    return this._deathRow[id + ''];
  }

  remove(id) {
    delete this._deathRow[id + ''];
  }
  
  forEach(cb) {
    Object.keys(this._deathRow).forEach(cb);
  }

  get count() {
    return Object.keys(this._deathRow).length;
  }
}

module.exports = DeathRow;