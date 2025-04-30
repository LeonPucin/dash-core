import { IOFile } from './file';
import { ServiceLogger } from 'dash-core';
import path from 'path';

/** Reads config files and merges with defaults.*/
export class ConfigReader {
    private readonly logger;

    constructor(logger?: ServiceLogger) {
        this.logger = logger;
    }

    /**
     * Reads the configuration from the specified file and populates the given object with values from the file.
     * @param {string} configPath - The path to the configuration file (e.g., './config.json').
     * @param {TConfig} defaultConfig - The object that contains the default configuration values.
     * @returns {Promise<TConfig>} A promise that resolves to the merged configuration object.
     * @template TConfig - The type of the configuration object.
     */
    public async readConfig<TConfig>(configPath: string, defaultConfig: TConfig): Promise<TConfig> {
        try {
            const fullPath = path.resolve(configPath);

            const fileContent = await IOFile.read(fullPath);

            const parsedConfig = JSON.parse(fileContent);

            return Object.assign({}, defaultConfig, parsedConfig);
        } catch (error) {
            this.logger?.error('Error reading or parsing the configuration file:', error);
            return defaultConfig;
        }
    }
}
