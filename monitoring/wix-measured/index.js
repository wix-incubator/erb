'use strict';
const metrics = require('measured');
const rdbHistogram = require('rdb-histogram');

rdbHistogram.patchMeasured(metrics);

const metricsCollection = metrics.createCollection();
module.exports.default = metricsCollection;
module.exports.collection = (name) => metrics.createCollection(name);

