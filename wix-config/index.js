import fs from 'fs';
import _ from 'lodash';

var cachedConfig;

export const mappings = new Map()
    .set("appName", "APP_NAME")
    .set("port", "PORT")
    .set("managementPort", "MANAGEMENT_PORT")
    .set("mountPoint", "MOUNT_POINT");

export function get() {
    if (!cachedConfig)
        cachedConfig = new WixConfig();

    return cachedConfig;
}

class WixConfig {
    constructor() {
        this._env = this._loadEnvironment(process.env);
        this._app = this._loadAppConfig(process.env);
    }

    get app() {
        return this._app;
    }

    get env() {
        return this._env;
    }

    _loadEnvironment(env) {
        let config = {};

        exports.mappings.forEach((envKey, key) => {
            if (env[envKey])
                config[key] = env[envKey];
            else
                throw Error(`Could not load environment key for property '${key}'`);
        });

        return config;
    }

    _loadAppConfig(env) {
        let confDir = env.APP_CONF_DIR ? env.APP_CONF_DIR : "/configs";
        let appName = _.last(env.APP_NAME.split("."));
        return JSON.parse(fs.readFileSync(`${confDir}/${appName}-config.json`, 'utf8'));
    }
}