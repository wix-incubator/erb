const kiloToMegaBytes = 1024 * 1024;

module.exports = class MemoryUsage {
  constructor(process) {
    this._process = process;
  }

  heapTotal() {
    return this._process.memoryUsage().heapTotal / kiloToMegaBytes;
  }

  heapUsed() {
    return this._process.memoryUsage().heapUsed / kiloToMegaBytes;
  }

  rss() {
    return this._process.memoryUsage().rss / kiloToMegaBytes;
  }
};