'use strict';

module.exports.inject = (scripts, config) => {
  const octoScripts = config.scripts || {};
  return scripts.map(script => {
    if (octoScripts[script.name]) {
      script.cmd = octoScripts[script.name];
    }
    return script;
  });
};