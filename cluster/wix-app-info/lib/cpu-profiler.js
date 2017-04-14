const profiler = require('v8-profiler');

const DEFAULT_DURATION = 60000;

module.exports = class CpuProfilesGenerator {
  generateResourceId(timestamp, {duration} = { duration: DEFAULT_DURATION }) {
    return `${timestamp}.${duration}`;
  }
  
  deserializeResourceFromId(id) {
    const parts = id.split('.'),
      date = new Date(parseInt(parts[0])),
      duration = parseInt(parts[1]);
    return {date, duration};
  }

  takeSnapshot(id, {duration} = { duration: DEFAULT_DURATION }) {
    profiler.startProfiling(id);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(profiler.stopProfiling(id));
      }, duration);
    });
  }
  
  resourceType() {
    return 'cpuprofile';
  }
};
