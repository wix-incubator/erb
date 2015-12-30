'use strict';
const _ = require('lodash'),
  views = require('./commons'),
  packageJson = require('../../package.json'),
  xml2js = require('xml2js'),
  fs = require('fs'),
  os = require('os'),
  dateFormat = require('dateformat'),
  moment = require('moment'),
  prettyBytes = require('pretty-bytes'),
  cluster = require('cluster'),
  usage = require('usage');

class AboutView extends views.AppInfoView {

  _getMemUsage() {
    const empty = () => {
      return {memory: 0, memoryInfo: {rss: 0, vsize: 0}};
    };

    const lookup = pid => new Promise((resolve, reject) => usage.lookup(pid, (err, res) => {
      return resolve(res || empty());
    }));

    const lookups = [lookup(process.pid)];

    for (let id in cluster.workers) {
      lookups.push(lookup(cluster.workers[id].process.pid));
    }

    return Promise.all(lookups).then(results => {
      const aggregate = empty();
      results.forEach(item => {
        aggregate.memory += item.memory;
        aggregate.memoryInfo.rss += item.memoryInfo.rss;
        aggregate.memoryInfo.vsize += item.memoryInfo.vsize;
      });
      return aggregate;
    }).then(result => {
      return {
        memory: prettyBytes(result.memory),
        memoryRss: prettyBytes(result.memoryInfo.rss),
        memoryVSize: prettyBytes(result.memoryInfo.vsize)
      };
    });
  }

  _loadSyncData() {
    return Promise.resolve({
      nameNpm: packageJson.name,
      versionNpm: packageJson.version,
      nameEnv: process.env.APP_NAME,
      versionNode: process.version,
      uptimeOs: moment.duration(os.uptime(), 'seconds').humanize(),
      uptimeApp: moment.duration(process.uptime(), 'seconds').humanize(),
      serverCurrentTime: dateFormat(Date.now(), 'dd/mm/yyyy HH:MM:ss.l'),
      serverTimezone: dateFormat(Date.now(), 'Z'),
      processCount: Object.keys(cluster.workers).length + 1
    });
  }

  _loadPomXml() {
    return new Promise(resolve => {
      fs.readFile('./pom.xml', (err, data) => {
        xml2js.parseString(data || '', (err, result) => {
          const xml = err ? {} : result;
          const project = xml.project ? xml.project : {};
          resolve({
            nameMvn: `${project.groupId}.${project.artifactId}`,
            versionMvn: project.version
          });
        });
      });
    });
  }

  get data() {
    return Promise.all([this._loadPomXml(), this._loadSyncData(), this._getMemUsage()])
      .then(results => {
        const res = {};
        results.forEach(item => _.merge(res, item));
        return res;
      })
      .then(res => {
        return {
          left: [
            views.item('Name (npm)', res.nameNpm),
            views.item('Name (env)', res.nameEnv),
            views.item('Name (mvn)', res.nameMvn),
            views.item('Version (npm)', res.versionNpm),
            views.item('Version (mvn)', res.versionMvn),
            views.item('Node version', res.versionNode),
            views.item('Uptime (os)', res.uptimeOs),
            views.item('Uptime (app)', res.uptimeApp),
            views.item('Server current time', res.serverCurrentTime),
            views.item('Server Timezone', res.serverTimezone)
          ],
          right: [
            views.item('Process count (master + workers)', res.processCount),
            views.item('Memory usage - master (rss)', res.memory),
            views.item('Memory usage - master (heapTotal)', res.memoryRss),
            views.item('Memory usage - master (heapUsed)', res.memoryVSize)
          ]
        };
      });
  }
}

module.exports = new AboutView({
  mountPath: '/about',
  title: 'Info',
  template: 'two-columns'
});