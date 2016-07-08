'use strict';
module.exports = context => {
  return {
    petri: aspects => context.petri.client(aspects)
  }
};