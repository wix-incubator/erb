const {readFileSync} = require('fs');
const {join} = require('path');
const Velocity = require('velocityjs');

function readErrorPageTemplate() {
  const ERROR_PAGES_PATH = join(__dirname, '/dependencies/com.wixpress.framework.wix-error-assets/views/errorPages/');
  const ERROR_PAGES_FILE_NAME = 'error-pages.vm';

  const errorPagesFullPath = join(ERROR_PAGES_PATH, ERROR_PAGES_FILE_NAME);
  return readFileSync(errorPagesFullPath, {encoding: 'utf8'});
}

function errorPageRenderer(publicStaticsUrl) {
  const buildModel = errorPagesModel(publicStaticsUrl);
  const errorPagesTemplate = readErrorPageTemplate();
  const ast = Velocity.parse(errorPagesTemplate);
  const compiledTemplate = new Velocity.Compile(ast);

  return (req, httpStatusCode, errorCode) => {
    const errorPagesModel = buildModel(req, httpStatusCode, errorCode);
    return compiledTemplate.render(errorPagesModel);
  };
}

function errorPagesModel(wixPublicStaticsUrl) {
  return (req, httpStatusCode, errorPageCode) => {
    const webContextAspect = (req.aspects && req.aspects['web-context']) || {};

    return {
      debug: webContextAspect.debug,
      locale: webContextAspect.language,
      /** Need to get if from the request 'aspects'
       * https://github.com/wix-platform/wix-framework/blob/71483071fcbb5fb14a0cbb3ac22db7d87bc0eb8f/wix-framework/src/main/java/com/wixpress/framework/exceptions/WixMappingExceptionResolver.java#L488 */
      baseDomain: webContextAspect.cookieDomain,
      topology: {resolve: () => wixPublicStaticsUrl},
      /** HttpStatus or Custom internal error string
       * https://github.com/wix-private/wix-public-static/blob/28c064d84fcc40c9949319be91096d63cc6de9dd/app/scripts/error-pages/controllers/error-page.ctrl.js */
      errorPageCode: httpStatusCode,
      /** Used for BI
       * https://github.com/wix-platform/wix-framework/blob/71483071fcbb5fb14a0cbb3ac22db7d87bc0eb8f/wix-framework/src/main/java/com/wixpress/framework/exceptions/WixMappingExceptionResolver.java#L482 */
      serverErrorCode: errorPageCode,
      /** Consider protect by existing Feature Toggle (https://github.com/wix-platform/wix-framework/blob/71483071fcbb5fb14a0cbb3ac22db7d87bc0eb8f/wix-framework/src/main/java/com/wixpress/framework/exceptions/WixMappingExceptionResolver.java#L483)
       * https://jira.wixpress.com/browse/WOS-598 */
      addBotDetectionSnippet: false,
      /** Deprecated */
      exceptionName: null,
      /** {} (empty json) or relevant data -only- for the custom errors
       * https://github.com/wix-platform/wix-framework/blob/71483071fcbb5fb14a0cbb3ac22db7d87bc0eb8f/wix-framework/src/main/java/com/wixpress/framework/exceptions/WixMappingExceptionResolver.java#L491-L498 */
      data: {}
    }
  }
}

module.exports = errorPageRenderer;
