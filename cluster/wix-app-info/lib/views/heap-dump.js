const views = require('./commons'),
  profilingResourceApi = require('./profiling-resource-api').profilingResourceApi,
  ProfilingResourcesManager = require('../profiling-resources-manager'),
  HeapDumpsGenerator = require('../heap-dumper'),
  moment = require('moment');

class HeapDumpView extends views.AppInfoView {
  constructor(opts) {
    super(opts);
    this._dumper = new ProfilingResourcesManager({
      folder: `${opts.tmpFolder}/heapdump`,
      resourceGenerator: new HeapDumpsGenerator()
    });
  }

  api() {
    return profilingResourceApi(this._dumper, this._mountPath);
  }

  view() {
    return this._dumper.list().then((dumps) => {
      const items = dumps.map((dump) => {
        const date = dump.resource.date;
        return {
          name: date.toISOString(),
          timeago: moment(date).fromNow(true),
          status: dump.status,
          downloadable: dump.status === 'READY',
          downloadUri: `heap-dump/api/download/${dump.id}`
        }
      });
      return {items};
    });
  }
}

module.exports = tmpFolder => new HeapDumpView({
  mountPath: '/heap-dump',
  title: 'Heap',
  template: 'heap-dump',
  tmpFolder: tmpFolder
});
