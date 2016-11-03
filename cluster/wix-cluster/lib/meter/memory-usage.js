const kiloToMegaBytes = 1024 * 1024;
const updateIntervalMs = 5000;

module.exports.interval = updateIntervalMs;

module.exports.usage = cb => {
  send(cb);
  const stop = setInterval(() => send(cb), updateIntervalMs);

  return () => clearInterval(stop);
};

function send(cb) {
  const usage = process.memoryUsage();
  cb({
    rss: usage.rss / kiloToMegaBytes,
    heapTotal: usage.heapTotal / kiloToMegaBytes,
    heapUsed: usage.heapUsed / kiloToMegaBytes
  });
}