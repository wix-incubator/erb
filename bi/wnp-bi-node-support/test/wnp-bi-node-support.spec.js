const expect = require('chai').expect,
  biLogger = require('wix-bi-logger-client'),
  adapter = require('../'),
  shelljs = require('shelljs');

describe('bi logger node adapter it', () => {
  const logDir = './target/logs';

  beforeEach(() => {
    shelljs.rm('-rf', logDir);
    shelljs.mkdir('-p', logDir);
  });

  it('should fail if factory is not provided', () =>
    expect(() => adapter.addTo()).to.throw('factory must be provided'));

  it('should fail if options are not provided', () =>
    expect(() => adapter.addTo({})).to.throw('opts must be provided'));

  it('should fail if options does not contain artifactName', () =>
    expect(() => adapter.addTo({}, {})).to.throw('opts.artifactName must be provided'));

  it('should fail if options does not contain logDir', () =>
    expect(() => adapter.addTo({}, { artifactName: 'some'})).to.throw('opts.logDir must be provided'));

  it('should fail if options does not contain filePrefix', () =>
    expect(() => adapter.addTo({}, { artifactName: 'some', logDir: './some'})).to.throw('opts.filePrefix must be provided'));

  it('should successfully adapt existing factory', () => {
    const biFactory = biLogger.factory();
    const logger = adapter.addTo(biFactory, {
      logDir: logDir,
      filePrefix: 'w-bi',
      artifactName: 'an-artifact'
    }).logger({});

    return logger.log({evt: 1}).then(() => {
      const evt = JSON.parse(shelljs.cat(logDir + '/w-bi.*'));
      expect(evt).to.contain.deep.property('MESSAGE.evt', 1);
      expect(evt).to.contain.deep.property('GLOBAL.artifact_name', 'an-artifact');
    });
  });

});
