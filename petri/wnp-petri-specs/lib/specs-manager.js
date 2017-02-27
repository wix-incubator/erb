const SpecsCollector = require('./specs-collector'),
  SpecsFeeder = require('./specs-feeder');

class PetriSpecsManager {
  
  constructor(rpcFactory, petriUrl, log) {
    this._collector = new SpecsCollector();
    this._feeder = new SpecsFeeder(rpcFactory, petriUrl);
    this._log = log;
  }
  
  addSpecs(specs) {
    this._collector.addSpecs(specs);
  }
  
  send() {
    if (this._collector.nonEmpty) {
      this._log.info(`Uploading petri specs: ${Object.keys(this._collector.specs)}`);
      return this._feeder.send(this._collector.specs)
        .catch(e => {
          this._log.error('Failed to upload petri specs');
          throw e;
        });
    } else {
      this._log.info('No petri specs detected for upload');
      return Promise.resolve({});
    }
  }
}

module.exports = PetriSpecsManager;
