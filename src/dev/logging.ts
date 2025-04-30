import path from 'path';
import { createLogger, format, Logger, transports } from 'winston';

const RESET = '\x1b[0m';  // Reset to default color
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARNING = 'warn',
    ERROR = 'error'
}

const LogLevelMap: Record<LogLevel, number> = {
    [LogLevel.ERROR]: 1,
    [LogLevel.WARNING]: 2,
    [LogLevel.INFO]: 3,
    [LogLevel.DEBUG]: 4
};

const defaultFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat());

const fileFormat = format.combine(
    defaultFormat,
    format.printf((info) => {
        const { timestamp, level, message, service } = info;
        const splat = (info[Symbol.for('splat')] || []) as unknown[];
        let baseLog = `${timestamp}\t${level}\t${service}\t${message}`;

        if (splat && splat.length > 0)
            baseLog += '\n' + deserializeSplat(splat);

        return baseLog;
    }));

const consoleFormat = format.combine(
    defaultFormat,
    format.printf((info) => {
        const { timestamp, level, message, service } = info;
        const splat = (info[Symbol.for('splat')] || []) as unknown[];
        let baseLog = level === LogLevel.INFO || level === LogLevel.DEBUG
            ? `${CYAN}${timestamp}${RESET}\t${level}\t${GREEN}${service}${RESET}\t${message}`
            : `${timestamp}\t${level}\t${service}\t${message}`;

        if (splat && splat.length > 0)
            baseLog += '\n' + deserializeSplat(splat);

        if (level === LogLevel.ERROR) return `${RED}${baseLog}${RESET}`;
        if (level === LogLevel.WARNING) return `${YELLOW}${baseLog}${RESET}`;

        return baseLog;
    }));

function deserializeSplat(splat: unknown[]): string {
    return splat
        .map((data) => {
            if (data instanceof Error) {
                return data.stack;
            }

            if (typeof data === 'object') {
                try {
                    return JSON.stringify(data, null, 2);
                } catch {
                    return String(data);
                }
            }

            return String(data);
        })
        .join(' ');
}

function parseFilter(input?: string): Map<string, boolean> {
    const map = new Map<string, boolean>();
    if (!input) {
        return map;
    }

    input.split(",").forEach((raw) => {
        const item = raw.trim();
        if (item === "") return;
        const isIncluded = !item.startsWith("!");
        const name = item.replace(/^!/, "").trim();
        map.set(name, isIncluded);
    });

    return map;
}

function createWinstonLogger(options: ServiceInfo): Logger {
    const globalLogLevel = options.globalLogLevel;
    const targetLogLevel = options.logLevel;

    const logLevel = LogLevelMap[globalLogLevel] < LogLevelMap[targetLogLevel] ? globalLogLevel : targetLogLevel

    const projectDirectory = options.logPath || process.cwd();
    const logDirectory = path.join(projectDirectory, 'logs');

    const result = createLogger({
        level: logLevel,

        format: fileFormat,

        defaultMeta: { service: 'user-service' },

        transports: [
            new transports.File({ filename: path.join(logDirectory, 'error.log'), level: LogLevel.ERROR }),
            new transports.File({ filename: path.join(logDirectory, 'combined.log') }),
        ],
    });

    if (options.verbose) {
        result.add(
            new transports.Console({
                format: consoleFormat
            })
        );
    }

    return result;
}

/** Encapsulates service logging with configurable options. */
export class ServiceLogger {
    private readonly logger: Logger;

    private readonly options: ServiceInfo;

    private get isObservable(): boolean {
        const item = this.options.globalFilter.get(this.options.serviceName);

        if (item === undefined)
            return true;

        return item;
    }

    /**
     * Creates a new instance of the ServiceLogger class with specified options.
     * If no options are provided, defaults are used.
     * @param {ServiceOptions} [options={}] - Configuration options for the logger.
     * @param {string}  options.serviceName - The name of the service (default is "nameless-service").
     * @param {LogLevel} options.logLevel - The default log level (default is LogLevel.DEBUG).
     * @param {boolean} options.verbose - Indicates whether verbose logging is enabled (default is true).
     * @param {string} options.logPath - The directory where logs will be stored (default is the current working directory).
     * @param {LogLevel} options.globalLogLevel - The global log level for the service (default is LogLevel.DEBUG).
     * @param {string} options.globalFilter - A filter string for global logging configuration.
     */
    constructor(options: ServiceOptions = {}) {
        this.options = {
            serviceName: options.serviceName || "nameless-service",
            logLevel: options.logLevel || LogLevel.DEBUG,
            verbose: options.verbose || true,
            logPath: options.logPath || process.cwd(),
            globalLogLevel: options.globalLogLevel || LogLevel.DEBUG,
            globalFilter: parseFilter(options.globalFilter)
        }

        this.logger = createWinstonLogger(this.options)
        this.logger.defaultMeta = { service: this.options.serviceName };
    }

    /**
     * Logs an informational message if the service is observable.
     * @param {string} message - The message to log.
     * @param {...unknown[]} meta - Additional metadata to log alongside the message.
     */
    public info(message: string, ...meta: unknown[]): void {
        if (!this.isObservable)
            return;

        this.logger.info(message, ...meta);
    };

    /**
     * Logs a warning message.
     * @param {string} message - The message to log.
     * @param {...unknown[]} meta - Additional metadata to log alongside the message.
     */
    public warning(message: string, ...meta: unknown[]): void {
        this.logger.warn(message, ...meta);
    }

    /**
     * Logs a debug message if the service is observable.
     * @param {string} message - The message to log.
     * @param {...unknown[]} meta - Additional metadata to log alongside the message.
     */
    public debug(message: string, ...meta: unknown[]): void {
        if (!this.isObservable)
            return;

        this.logger.debug(message, ...meta);
    }

    /**
     * Logs an error message and returns an Error object.
     * @param {string} message - The error message.
     * @param {...unknown[]} meta - Additional metadata to log alongside the message.
     * @returns {Error} The created error.
     */
    public error(message: string, ...meta: unknown[]): Error {
        this.logger.error(message, ...meta);
        return new Error(message);
    }

    /**
     * Adds transport to the logger to write logs to a specified file.
     * @param {string} relativePath - The relative path where the log file will be stored.
     * @param {LogLevel} [logLevel] - The log level for this transport. If not provided, all logs will be written.
     */
    public addTransport(relativePath: string, logLevel?: LogLevel): void {
        if (!this.options.verbose)
            return;

        let transport;

        const fullLogPath = path.join(this.options.logPath, relativePath);

        if (!logLevel) {
            transport = new transports.File({ filename: path.join(fullLogPath) });
        } else {
            transport = new transports.File({ filename: path.join(fullLogPath), level: logLevel });
        }

        this.logger.add(transport);
    }
}

type ServiceInfo = {
    serviceName: string;
    logLevel: LogLevel;
    verbose: boolean;
    logPath: string;
    globalLogLevel: LogLevel;
    globalFilter: Map<string, boolean>;
}

type ServiceOptions = {
    serviceName?: string;
    logLevel?: LogLevel;
    verbose?: boolean;
    logPath?: string;
    globalLogLevel?: LogLevel;
    globalFilter?: string
}