'use strict';
require('wix-cluster').run(() => require('./app-info-app')(), {workerCount: 2});