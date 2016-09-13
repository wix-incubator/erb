const Velocity = require('velocityjs');
const fs = require('fs');

module.exports = (config) => {

  const templatePath = path.resolve(config.topology.publicStaticBaseUri);
  let renderModal = {
    staticsUrl: '//static.parastorage.com/services/'
  };
  return {
    render500: (err, req) => {
      return 'Internal Server Error';
    },
    render504: (err, req) => {
      return 'Gateway Timeout';
    }
  };

  function renderVM(errorModel) {
    gettingVMFile().then(() => {
      return Velocity.render(contents, appModel);
    });
  }

  function gettingVMFile() {
    fs.readFile(templatePath, 'utf8', (err, contents) => {
      if (err) {
        throw err;
      }
      return contents;
    });
  }
};

