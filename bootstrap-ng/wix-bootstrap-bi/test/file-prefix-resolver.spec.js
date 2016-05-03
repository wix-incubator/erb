'use strict';
const expect = require('chai').expect,
  resolve = require('../lib/file-prefix-resolver');

describe('file prefix resolver', () => {

  it('should resolve prefix to "wix.bi" given app is running in a non-clustered mode', () => {
    expect(resolve(nonClustered())).to.equal('wix.bi');
  });

  it('should resolve prefix to "wix.bi.worker-id" given app is running in a non-clustered mode', () => {
    expect(resolve(clusteredWorker(10))).to.equal('wix.bi.worker-10');
  });

  function nonClustered() {
    return {
      isWorker: false
    }
  }

  function clusteredWorker(id) {
    return {
      isWorker: true,
      worker: {id}
    }
  }
});