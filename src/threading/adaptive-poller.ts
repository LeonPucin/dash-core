import { TimeSpan, ServiceLogger } from 'dash-core';


type pollerOptions = {
    /** Initial delay before starting the first poll cycle. */
    initialDelay: TimeSpan,

    /** Maximum delay between polling cycles. */
    maxDelay: TimeSpan,

    /** Factor by which the delay will be multiplied on each failure. */
    factor: number,

    /** Time period after which the delay will reset to the initial delay if no errors occur. */
    resetPeriod: TimeSpan,

    /** The step used for linear delay decrease. */
    linearStep: TimeSpan,

    /** Optional logger for logging events during polling. */
    logger?: ServiceLogger,
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

    private readonly defaultOptions: pollerOptions = {
        initialDelay: TimeSpan.fromSeconds(1),
        maxDelay: TimeSpan.fromMinutes(1),
        factor: 1.5,
        resetPeriod: TimeSpan.fromMinutes(5),
        linearStep: TimeSpan.fromSeconds(1)
    }

    /**
     * Returns whether the polling operation is currently active.
     * @returns {boolean} True if polling is ongoing, false otherwise.
     */
    public get isPolling(): boolean {
        return this.polling;
    }

    /**
     * Creates an instance of the AdaptivePoller class.
     * @param {pollerOptions} options - Configuration options for the polling mechanism.
     * @param {TimeSpan} options.initialDelay - The initial delay before the first polling attempt.
     * @param {TimeSpan} options.maxDelay - The maximum delay between polling attempts.
     * @param {number} options.factor - The factor by which the delay will be multiplied after each failure.
     * @param {TimeSpan} options.resetPeriod - The period after which the delay will reset to the initial value if no errors occur.
     * @param {TimeSpan} options.linearStep - The step used to decrease the delay linearly on success.
     * @param {ServiceLogger} [options.logger] - Optional logger to log events during polling.
     */
    constructor(options?: Partial<pollerOptions>) {
        this.options = { ...this.defaultOptions, ...options };

        this.currentDelay = this.options.initialDelay.totalMilliseconds;
    }

    /**
     * Starts the polling process, which continues until explicitly stopped.
     * @param {() => Promise<void>} operation - The operation to perform during each poll cycle.
     * @param {(error: Error) => void} onError - Optional callback to handle errors during polling.
     * @param {(error: Error) => void} onFail - Optional callback to handle failure events (when the interval exceeds maxDelay).
     */
    public start(operation: () => Promise<void>, onError?: (error: Error) => void, onFail?: (error: Error) => void) {
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
        if (!this.polling || !this.operation) return;

        try {
            await this.operation();

            const now = Date.now();

            // Reset the delay if no error occurred within the reset period
            if (!this.lastErrorTime || (now - this.lastErrorTime) >= this.options.resetPeriod.totalMilliseconds) {
                const initialDelay = this.options.initialDelay.totalMilliseconds;
                const linearDifference = this.currentDelay - this.options.linearStep.totalMilliseconds;

                this.currentDelay = Math.max(initialDelay, linearDifference);
            }
        } catch (error) {
            this.lastErrorTime = Date.now();
            this.currentDelay = this.currentDelay * this.options.factor;

            const resultError = error instanceof Error ? error : new Error(JSON.stringify(error));

            if (this.currentDelay >= this.options.maxDelay.totalMilliseconds) {
                // If delay exceeds maxDelay, trigger the onFail callback
                this.currentDelay = this.options.maxDelay.totalMilliseconds;
                this.onFail?.(resultError);
            } else {
                // If an error occurred but delay is still within max, trigger the onError callback
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
