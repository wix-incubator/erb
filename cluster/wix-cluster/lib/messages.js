module.exports.isMessageFromWorkerFor = (msg, key) => {
  return !!(msg && msg.origin && msg.origin === 'wix-cluster' && msg.key && msg.key === key);
};