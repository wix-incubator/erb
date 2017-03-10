const uuidGenerator = require('uuid-support');

exports.resolve = (headers, query) => {
  return headers['x-wix-request-id'] || query['request_id'] || uuidGenerator.generate();
};
