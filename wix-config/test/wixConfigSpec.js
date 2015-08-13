import { expect } from 'chai';
import { mappings } from '../lib/index';

describe("wix-config", () => {

    beforeEach(reloadEnvironment);

    it("loads values form environment", () => {
        expect(loadConfig().env.port).to.be.equal(8080);
    });

    it("loads config from default location", () => {
        expect(loadConfig().app.cryptography.cipher.mainKey).to.be.equal("234234234");
    });

    it("fail to load if mandatory environment variable is missing", () => {
        mappings.forEach((envKey, key) => {
            reloadEnvironment();
            delete process.env[envKey];
            expect(loadConfig).to.throw(`Could not load environment key for property '${key}'`);
        });
    });

    it("fail to load if config is missing", function () {
        process.env.APP_CONF_DIR = "./configsqwe";
        expect(loadConfig).to.throw(/no such file or directory/);
    });

    function loadConfig() {
        delete require.cache[require.resolve('../lib/index')];
        return require('../lib/index').get();
    }

    function reloadEnvironment() {
        process.env = {
            APP_NAME: "com.wixpress.test",
            PORT: 8080,
            MANAGEMENT_PORT: 8084,
            MOUNT_POINT: "/node",
            APP_CONF_DIR: "./test"
        };
    }

});