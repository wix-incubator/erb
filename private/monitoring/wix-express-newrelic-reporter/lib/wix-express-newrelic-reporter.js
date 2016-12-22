module.exports = (newrelic, log) => {
  const maybeGetTransaction = safeTransactionGetter(newrelic, log);
  const maybeReportError = safeErrorReporter(newrelic, log);
  
  if (isStubNewRelicInstance(newrelic)) {
    log.debug('Stub new relic loaded - new relic error reporter not loaded');
    return function stubNewRelicErrorReporter(req, res, next) {
      next();
    };
  } else {
    return function newRelicErrorReporter(req, res, next) {
      const nrTransaction = maybeGetTransaction(newrelic, log);

      if (nrTransaction) {
        res.once('x-error', err => maybeReportError(nrTransaction, err));
        res.once('x-timeout', err => maybeReportError(nrTransaction, err));
      }

      next();
    };
  }
};

function safeTransactionGetter(newrelic, log) {
  return () => {
    let transaction = null;
    try {
      transaction = newrelic.agent.tracer.getTransaction();
    } catch(e) {
      log.error('Failed getting new relic transaction', e);
    }
    return transaction;
  }
}

function safeErrorReporter(newrelic, log) {
  return (transaction, error) => {
    try {
      newrelic.agent.errors.addUserError(transaction, error);  
    } catch (e) {
      log.error('Failed reporting error to new relic', e);
    }
  }
}

function isStubNewRelicInstance(newrelic) {
  return !newrelic.agent;
}
