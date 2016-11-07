const nsToMs = 1000000;
const updateIntervalMs = 1000;

module.exports.interval = updateIntervalMs;

module.exports.loop = cb => {
  const stop = setInterval(() => {
    const time = process.hrtime();
    process.nextTick(() => {
      const diff = process.hrtime(time);
      cb((diff[0] * 1e9 + diff[1])/nsToMs);
    });
  }, updateIntervalMs);

  return () => clearInterval(stop);
};

