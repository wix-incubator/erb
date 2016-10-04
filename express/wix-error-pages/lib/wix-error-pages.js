'use strict';
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const Velocity = require('velocityjs');

const ERROR_PAGES_FILE_NAME = 'error-pages.vm';

class WixErrorPages {

  constructor(config) {
    this.config = config;
  }

  init() {
    return this.readErrorPagesTemplate().then(errorPagesTemplate => this.errorPagesTemplate = errorPagesTemplate);
  }

  render500(req) {
    const errorPagesModel = new ErrorPagesModel(this.config, req, '500');
    return this.renderErrorPage(errorPagesModel);
  }

  renderErrorPage(errorPagesModel) {
    return Velocity.render(this.errorPagesTemplate, errorPagesModel);
  }

  readErrorPagesTemplate() {
    const localFilePath = path.resolve(this.config.wixPublicLocalFilePath);
    const errorPagesFullPath = path.join(localFilePath, ERROR_PAGES_FILE_NAME);

    console.log(errorPagesFullPath);
    const readFile = Promise.promisify(fs.readFile);
    return readFile(errorPagesFullPath, 'utf8');
  }
}

class ErrorPagesModel {

  constructor(config, req, errorPageCode, errorData) {

    // TODO: check with Vilius that this is the right way to extract the next 3 properties from the `req.aspects['web-context']`
    const webContextAspect = (req.aspects && req.aspects['web-context']) || {};

    this.debug = webContextAspect.debug;
    this.locale = webContextAspect.locale;

    /**
     * Need to get if from the request 'aspects'
     * https://github.com/wix-platform/wix-framework/blob/71483071fcbb5fb14a0cbb3ac22db7d87bc0eb8f/wix-framework/src/main/java/com/wixpress/framework/exceptions/WixMappingExceptionResolver.java#L488
     *
     * @type {string}
     */
    this.baseDomain = webContextAspect.cookieDomain;

    this.staticBaseUrl = config.staticBaseUrl;

    /**
     * A function to get the staticsUrl
     * It's function and not just the staticsUrl string itself because in the Scala framework serves the error page and its unaware of the each artifact staticsUrl
     *
     * TODO:
     * Consider modify the error-pages.vm to accept a staticsUrl string in addition to the resolve function
     *
     * @type { { resolve: () => string } }
     */
    this.topology = {
      resolve: () => {
        return config.wixPublicStaticsUrl;
      }
    };

    /**
     * HttpStatus or Custom internal error string
     * https://github.com/wix-private/wix-public-static/blob/28c064d84fcc40c9949319be91096d63cc6de9dd/app/scripts/error-pages/controllers/error-page.ctrl.js
     * @type {string}
     */
    this.errorPageCode = errorPageCode;

    /**
     * {} (empty json) or relevant data -only- for the custom errors
     * https://github.com/wix-platform/wix-framework/blob/71483071fcbb5fb14a0cbb3ac22db7d87bc0eb8f/wix-framework/src/main/java/com/wixpress/framework/exceptions/WixMappingExceptionResolver.java#L491-L498
     * @type {any}
     */
    this.data = errorData || {};

    /**
     * Deprecated
     */
    this.exceptionName = null;

    /**
     * Used for BI
     * https://github.com/wix-platform/wix-framework/blob/71483071fcbb5fb14a0cbb3ac22db7d87bc0eb8f/wix-framework/src/main/java/com/wixpress/framework/exceptions/WixMappingExceptionResolver.java#L482
     * @type {string}
     */
    this.serverErrorCode = '-199';

    /**
     * Consider protect by existing Feature Toggle (https://github.com/wix-platform/wix-framework/blob/71483071fcbb5fb14a0cbb3ac22db7d87bc0eb8f/wix-framework/src/main/java/com/wixpress/framework/exceptions/WixMappingExceptionResolver.java#L483)
     * https://jira.wixpress.com/browse/WOS-598
     * @type {boolean}
     */
    this.addBotDetectionSnippet = true;
  }
}

module.exports = WixErrorPages;