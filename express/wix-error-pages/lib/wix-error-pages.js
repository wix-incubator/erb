const Velocity = require('velocityjs');
const path = require('path');
const Promise = require('bluebird');
const readFile = Promise.promisify(require('fs').readFile);

module.exports = WixErrorPages;

function WixErrorPages() {

  return {
    setup: (config) => {
      this.config = config;
      return gettingVMFile(config.templatePath).then(templateContent => {
        this.templateContent = templateContent;
      });
    },
    render500: () => {
      const renderModel = createRenderModel(500);
      const html = renderVM(renderModel);
      return html;
    },
    render504: () => {
      const renderModel = createRenderModel(504);
      const html = renderVM(renderModel);
      return html;
    }
  }

  function createRenderModel(errorCode) {
    return {
      staticsUrl: this.config.staticsUrl,
      errorPageCode: errorCode,
      serverErrorCode: errorCode
    }
  }

  function gettingVMFile(templatePath) {
    const vmPath = path.resolve(templatePath);
    return readFile(vmPath, 'utf8');
  }

  function renderVM(renderModel) {
    return Velocity.render(this.templateContent, renderModel);
  }
}

