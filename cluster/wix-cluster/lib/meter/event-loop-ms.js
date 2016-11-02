const nsToMs = 1000000;

module.exports = cb => {
  const interval = setInterval(() => {
    const time = process.hrtime();
    process.nextTick(() => {
      const diff = process.hrtime(time);
      cb((diff[0] * 1e9 + diff[1])/nsToMs);
    });
  }, 1000);
  return () => clearInterval(interval);
};

