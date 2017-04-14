const views = require('./commons'),
  profilingResourceApi = require('./profiling-resource-api').profilingResourceApi,
  ProfilingResourcesManager = require('../profiling-resources-manager'),
  CpuProfilesGenerator = require('../cpu-profiler'),
  moment = require('moment'),
  duration = require('human-duration');

class CpuProfileView extends views.AppInfoView {
  constructor(opts) {
    super(opts);
    this._dumper = new ProfilingResourcesManager({
      folder: `${opts.tmpFolder}/profiles`,
      resourceGenerator: new CpuProfilesGenerator()
    });
  }

  api() {
    return profilingResourceApi(this._dumper, this._mountPath);
  }

  view() {
    return this._dumper.list().then((profiles) => {
      const items = profiles.map((profile) => {
        const date = profile.resource.date;
        return {
          name: date.toISOString(),
          duration: duration.fmt(profile.resource.duration).segments(1),
          timeago: moment(date).fromNow(true),
          status: profile.status,
          downloadable: profile.status === 'READY',
          downloadUri: `cpu-profile/api/download/${profile.id}`
        }
      });
      return {items};
    });
  }
}

module.exports = tmpFolder => new CpuProfileView({
  mountPath: '/cpu-profile',
  title: 'CPU',
  template: 'cpu-profile',
  tmpFolder: tmpFolder
});
