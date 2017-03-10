require('wix-cluster').run(() => require('./app-info-app')(), {workerCount: 2, metrics: {app_host: 'local', app_name: 'app'}});
