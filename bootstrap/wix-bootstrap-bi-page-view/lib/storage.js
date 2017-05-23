const _ = require('lodash');

module.exports = res => _.defaultsDeep(res.locals, {'_wnp': '_bi-page-view'});
