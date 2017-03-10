const runner = require('../..');

runner({metrics: {app_host: 'local', app_name: 'app'}})(() => console.log(`pid: ${process.pid}`));

