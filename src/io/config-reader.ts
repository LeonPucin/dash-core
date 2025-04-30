import { IOFile } from './file';
import { ServiceLogger } from 'dash-kit';
import path from 'path';

export class ConfigReader {
    private readonly logger;

    constructor(logger?: ServiceLogger) {
        this.logger = logger;
    }

    /**
     * Reads the configuration from the specified file and populates the given object with values from the file.
     *
     * @param configPath - path to the configuration file (e.g., './config.json')
     * @param defaultConfig - object with initial (default) configuration values
     * @returns the final object, merged with data from the file
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
