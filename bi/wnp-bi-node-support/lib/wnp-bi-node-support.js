const rollingFile = require('wnp-rolling-file'),
  format = require('strftime').utc(),
  assert = require('assert');

module.exports = (biLoggerFactory, opts) => {
  assert(biLoggerFactory, 'factory must be provided');
  assert(opts, 'opts must be provided');
  assert(opts.artifactName, 'opts.artifactName must be provided');
  assert(opts.logDir, 'opts.logDir must be provided');
  assert(opts.filePrefix, 'opts.filePrefix must be provided');

  const artifactName = opts.artifactName;
  const logDir = opts.logDir;
  const filePrefix = opts.filePrefix;
  const date = opts.date || now;

  const publisher = fileBackedPublisher(logDir, filePrefix);
  return biLoggerFactory.addPublisher(publish(publisher, artifactName, date));
};
function fileBackedPublisher(logDir, filePrefix) {
  const logger = rollingFile(logDir, {prefix: filePrefix});
  return data => {
    return new Promise((resolve, reject) => {
      logger.write(JSON.stringify(data), error => {
        return error ? reject(error) : resolve();
      });
    });
  };
}

function now() {
  return new Date();
}

function publish(publisher, artifactName, date) {
  return (evt, context) => {
    const msg = aMessage(evt, artifactName, date);

    ifPresent(context['web-context'], 'userIp', key => msg.GLOBAL['ip'] = key);
    ifPresent(context['web-context'], 'userAgent', key => msg.GLOBAL['user_agent'] = key);
    ifPresent(context['web-context'], 'localUrl', key => msg.GLOBAL['url'] = key);
    ifPresent(context['web-context'], 'url', key => msg.GLOBAL['app_url'] = key);
    ifPresent(context['web-context'], 'requestId', key => msg.GLOBAL['request_id'] = key);
    ifPresent(context['web-context'], 'language', key => msg.GLOBAL['lng'] = key);

    ifPresent(context['bi'], 'clientId', key => msg.GLOBAL['client_id'] = key);
    ifPresent(context['bi'], 'globalSessionId', key => msg.GLOBAL['gsi'] = key);

    ifPresent(context['session'], 'userGuid', key => msg.GLOBAL['uuid'] = key);

    return publisher(msg);
  }
}

function aMessage(event, artifactName, date) {
  return {
    MESSAGE: event,
    GLOBAL: {
      date: format('%FT%T.%LZ', date()),
      artifact_name: artifactName
    }
  };
}

function ifPresent(aspect, key, fn) {
  if (aspect && aspect[key]) {
    fn(aspect[key]);
  }
}
