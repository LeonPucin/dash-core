import { TimeSpan, ServiceLogger } from 'dash-core';


type pollerOptions = {
    initialDelay: TimeSpan,
    maxDelay: TimeSpan,
    factor: number,
    resetPeriod: TimeSpan,
    linearStep: TimeSpan
    logger?: ServiceLogger,
}

const defaultOptions: pollerOptions = {
    initialDelay: TimeSpan.fromSeconds(1),
    maxDelay: TimeSpan.fromMinutes(1),
    factor: 1.5,
    resetPeriod: TimeSpan.fromMinutes(5),
    linearStep: TimeSpan.fromSeconds(1)
}

/**
 * Handles polling with adaptive intervals, adjusting delays based on success or failure.
 */
export class AdaptivePoller {
    private currentTimeout?: NodeJS.Timeout;

    private currentDelay: number;

    private lastErrorTime?: number;

    private polling: boolean = false;
    private operation?: (() => Promise<void>);
    private onError?: ((error: Error) => void);
    private onFail?: ((error: Error) => void);

    private readonly options: pollerOptions;

    /**
     * Returns whether the polling operation is currently active.
     * @returns {boolean} True if polling is ongoing, false otherwise.
     */
    public get isPolling(): boolean {
        return this.polling;
    }

    constructor(options: pollerOptions = defaultOptions) {
        this.options = options;

        this.currentDelay = this.options.initialDelay.totalMilliseconds;
    }

    /**
     * Starts the polling process.
     * The polling will continue until explicitly stopped.
     * @param {() => Promise<void>} operation - The operation to perform during each poll cycle.
     * @param {((error: Error) => void) | null} [onError=null] - A callback to handle errors during polling.
     * @param {((error: Error) => void) | null} [onFail=null] - A callback to handle failure events (when the interval exceeds maxDelay).
     */
    public start(operation: () => Promise<void>, onError?: ((error: Error) => void), onFail?: ((error: Error) => void)) {
        if (this.polling) return;

        this.polling = true;

        this.operation = operation;
        this.onError = onError;
        this.onFail = onFail;

        this.currentDelay = this.options.initialDelay.totalMilliseconds;

        this.runPoll();

        this.options.logger?.info('AdaptivePolling started');
    }

    /**
     * Stops the polling process.
     */
    public stop(): void {
        this.polling = false;
        clearTimeout(this.currentTimeout);

        this.options.logger?.info('AdaptivePolling stopped');
    }

    private async runPoll(): Promise<void> {
        if (!this.polling || !this.operation)
            return;

        try {
            await this.operation();

            const now = Date.now();

            if (!this.lastErrorTime || (now - this.lastErrorTime) >= this.options.resetPeriod.totalMilliseconds) {
                const initialDelay = this.options.initialDelay.totalMilliseconds;
                const linearDifference = this.currentDelay - this.options.linearStep.totalMilliseconds

                this.currentDelay = Math.max(initialDelay, linearDifference);
            }
        } catch (error) {
            this.lastErrorTime = Date.now();
            this.currentDelay = this.currentDelay * this.options.factor;

            const resultError = error instanceof Error ? error : new Error(JSON.stringify(error));

            if (this.currentDelay >= this.options.maxDelay.totalMilliseconds) {
                this.currentDelay = this.options.maxDelay.totalMilliseconds;
                this.onFail?.(resultError);
            } else {
                this.onError?.(resultError);
            }
        } finally {
            this.scheduleNextPoll();
        }
    }

    private scheduleNextPoll(): void {
        this.currentTimeout = setTimeout(() => this.runPoll(), this.currentDelay);
    }
}
