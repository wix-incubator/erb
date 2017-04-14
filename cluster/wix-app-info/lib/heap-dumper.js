const profiler = require('v8-profiler');

module.exports = class HeapDumpsGenerator {
  generateResourceId(timestamp) {
    return `${timestamp}`;
  }

  deserializeResourceFromId(id) {
    return {date: new Date(parseInt(id, 10))};
  }

  takeSnapshot(id) {
    return Promise.resolve(profiler.takeSnapshot(id));
  }

  resourceType() {
    return 'heapsnapshot';
  }
};
