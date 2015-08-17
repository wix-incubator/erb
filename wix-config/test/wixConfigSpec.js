import { expect } from 'chai';

describe("wix-config", () => {

  beforeEach(() => {
    unloadConfig();
    resetEnvironment();
  });

  it("caches config between imports", () => {
    var wixConfig = require('../lib/wix-config');
    var config = wixConfig.get();

    delete process.env;

    expect(wixConfig.get()).to.deep.equal(config);
  });

  it("loads values form environment", () => {
    var config = loadConfig();

    expect(config.env.appName).to.be.equal("com.wixpress.test");
    expect(config.env.port).to.be.equal(8080);
    expect(config.env.managementPort).to.be.equal(8084);
    expect(config.env.mountPoint).to.be.equal("/node");
  });

  it("loads config from default location", () => {
    expect(loadConfig().cryptography.cipher.mainKey).to.be.equal("234234234");
  });

  it("does not override 'env' values form config", () => {
    process.env.APP_NAME = "com.wixpress.test-with-env";

    let config = loadConfig();

    expect(config.env.port).to.be.equal(3000);
    expect(config.env.managementPort).to.be.equal(3004);
    expect(config.env.appName).to.be.equal('app-name');
    expect(config.env.mountPoint).to.be.equal('/mount-point');
  });

  it("merges values from config", () => {
    process.env.APP_NAME = "com.wixpress.test-with-partial-env";

    let config = loadConfig();

    expect(config.env.port).to.be.equal(3000);
    expect(config.env.managementPort).to.be.equal(8084);
    expect(config.env.appName).to.be.equal('com.wixpress.test-with-partial-env');
    expect(config.env.mountPoint).to.be.equal('/node');
  });

  it("fails only if environment variable is not present neither in env nor in config", () => {
    process.env.APP_NAME = "com.wixpress.test-with-partial-env";
    delete process.env.MANAGEMENT_PORT;

    expect(loadConfig).to.throw("Could not load environment key for property: MANAGEMENT_PORT");

  });

  it("fail to load if config is missing", function () {
    process.env.APP_CONF_DIR = "./configsqwe";
    expect(loadConfig).to.throw(/no such file or directory/);
  });

  function loadConfig() {
    return require('../index').get();
  }

  function unloadConfig() {
    delete require.cache[require.resolve('../index')];
    delete require.cache[require.resolve('../lib/wix-config')];
  }

  function resetEnvironment() {
    process.env = {
      APP_NAME: "com.wixpress.test",
      PORT: 8080,
      MANAGEMENT_PORT: 8084,
      MOUNT_POINT: "/node",
      APP_CONF_DIR: "./test"
    };
  }

});