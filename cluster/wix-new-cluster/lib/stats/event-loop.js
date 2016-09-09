'use strict';

module.exports = (cb, opts) => {
  const options = Object.assign({}, opts, {every: 5000});
  setInterval(() => {
    const time = process.hrtime();
    process.nextTick(() => {
      const diff = process.hrtime(time);
      cb(diff[0] * 1e9 + diff[1]);
    });
  }, options.every);
};

