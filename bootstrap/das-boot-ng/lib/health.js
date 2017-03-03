module.exports = class Health {
  constructor() {
    this._alive = true;
  }

  fn() {
    return new Promise((resolve, reject) => {
      if (this._alive) {
        setTimeout(resolve, Math.abs(Math.random() * 1000));
      } else {
        reject(new Error('oh no'));
      }
    });
  }

  setAlive() {
    this._alive = true;
  }

  setDead() {
    this._alive = false;
  }

};
