'use strict';
const chance = require('chance')();

module.exports.randomPort = () => randomPort();

module.exports.generate = () => {
  return {
    PORT: randomPort(),
    MOUNT_POINT: '/app'
  };
};

function randomPort() {
  return chance.integer({min: 2999, max: 4000});
}
