import fs from 'fs';
import _ from 'lodash';

var cachedConfig;

const envKeys = new Map()
    .set("APP_NAME", String)
    .set("PORT", Number)
    .set("MANAGEMENT_PORT", Number)
    .set("MOUNT_POINT", String);

export function get() {
    if (!cachedConfig) {
        cachedConfig = new WixConfig().config;
    }

    return cachedConfig;
}

class WixConfig {
    constructor() {
        this._config = this._loadAppConfig(process.env);

        if (!this._config.env)
            this._config.env = this._loadEnvironment(process.env);
        else {
            this._config.env =  _.extend(this._loadEnvironment(process.env), this._config.env);
        }

        for (let key of envKeys.keys()) {
            if (!this._config.env[_.camelCase(key)])
                throw Error(`Could not load environment key for property '${key}'`);
        }
    }

    get config() {
        return this._config;
    }

    _loadEnvironment(env) {
        var config = {};
        envKeys.forEach((converter, key) => {
            if (env[key])
                config[_.camelCase(key)] = converter(env[key]);
        });

        return config;
    }

    _loadAppConfig(env) {
        let confDir = env.APP_CONF_DIR ? env.APP_CONF_DIR : "/configs";
        let appName = _.last(env.APP_NAME.split("."));
        return JSON.parse(fs.readFileSync(`${confDir}/${appName}-config.json`, 'utf8'));
    }
}