const trier = require('trier-promise');

const defaults = {
  timeout: 10000,
  interval: 200
};

module.exports = eventually;
module.exports.with = overrides => (fn, opts) => eventually(fn, Object.assign({}, overrides, opts));

function eventually(fn, opts) {
  return Promise.resolve().then(() => {
    let error = null;
    const action = () => Promise.resolve().then(() => fn()).catch(err => {
      error = err;
      throw err;
    });
    const options = Object.assign({action: action}, defaults, opts);
    return trier(options).catch(() => {
      if (error !== null) {
        error.message = `Timeout of ${options.timeout} ms with: ` + error.message;
      }
      throw error;
    });
  });
}