const _ = require('lodash');

module.exports.inject = (seenBy, responseObj) => {
  if (seenBy && seenBy.length > 0) {
    responseObj.headers['X-Seen-By'] = _.uniq(seenBy).join();
  }
};
