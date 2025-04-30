import { TimeSpan, ServiceLogger } from 'dash-core';

/**
 * Handles polling with adaptive intervals, adjusting delays based on success or failure.
 */
export class AdaptivePoller {
    private currentTimeout: NodeJS.Timeout | undefined = undefined;

    private currentDelay: number;
    private lastErrorTime: number | null = null;

    private polling: boolean = false;
    private operation: (() => Promise<void>) | null = null;
    private onError: ((error: Error) => void) | null = null;
    private onFail: ((error: Error) => void) | null = null;

    /**
     * Returns whether the polling operation is currently active.
     * @returns {boolean} True if polling is ongoing, false otherwise.
     */
    public get isPolling(): boolean {
        return this.polling;
    }

    /**
     * Creates an instance of the AdaptivePoller class with the specified configuration.
     * @param {TimeSpan} [initialDelay=TimeSpan.fromSeconds(1)] - The initial delay before the first operation.
     * @param {ServiceLogger} [logger] - A logger to log messages (optional).
     * @param {TimeSpan} [maxDelay=TimeSpan.fromMinutes(1)] - The maximum delay between operations on errors.
     * @param {number} [factor=1.5] - The multiplier for exponential interval increase on errors.
     * @param {TimeSpan} [resetPeriod=TimeSpan.fromMinutes(5)] - The period after which the interval starts to decrease linearly if no errors occur.
     * @param {TimeSpan} [linearStep=TimeSpan.fromSeconds(1)] - The step by which the interval decreases linearly on success.
     */
    constructor(
        private readonly initialDelay: TimeSpan = TimeSpan.fromSeconds(1),
        private readonly logger?: ServiceLogger,
        private readonly maxDelay: TimeSpan = TimeSpan.fromMinutes(1),
        private readonly factor: number = 1.5,
        private readonly resetPeriod: TimeSpan = TimeSpan.fromMinutes(5),
        private readonly linearStep: TimeSpan = TimeSpan.fromSeconds(1)
    ) {
        this.currentDelay = this.initialDelay.totalMilliseconds;
    }

    /**
     * Starts the polling process.
     * The polling will continue until explicitly stopped.
     * @param {() => Promise<void>} operation - The operation to perform during each poll cycle.
     * @param {((error: Error) => void) | null} [onError=null] - A callback to handle errors during polling.
     * @param {((error: Error) => void) | null} [onFail=null] - A callback to handle failure events (when the interval exceeds maxDelay).
     */
    public start(
        operation: () => Promise<void>,
        onError: ((error: Error) => void) | null = null,
        onFail: ((error: Error) => void) | null = null
    ): void {
        if (this.polling) return;

        this.polling = true;
        this.operation = operation;
        this.onError = onError;
        this.onFail = onFail;

        this.currentDelay = this.initialDelay.totalMilliseconds;

        this.runPoll();

        this.logger?.info('AdaptivePolling started');
    }

    /**
     * Stops the polling process.
     */
    public stop(): void {
        this.polling = false;
        clearTimeout(this.currentTimeout);

        this.logger?.info('AdaptivePolling stopped');
    }

    private async runPoll(): Promise<void> {
        if (!this.polling || !this.operation)
            return;

        try {
            await this.operation();
            const now = Date.now();

            if (this.lastErrorTime === null || (now - this.lastErrorTime) >= this.resetPeriod.totalMilliseconds) {
                this.currentDelay = Math.max(this.initialDelay.totalMilliseconds, this.currentDelay - this.linearStep.totalMilliseconds);
            }

            this.scheduleNextPoll();
        } catch (error) {
            this.lastErrorTime = Date.now();
            this.currentDelay = this.currentDelay * this.factor;

            const resultError = error instanceof Error ? error : new Error(JSON.stringify(error));

            if (this.currentDelay > this.maxDelay.totalMilliseconds) {
                this.currentDelay = this.maxDelay.totalMilliseconds;
                this.onFail?.(resultError);
            } else {
                this.onError?.(resultError);
            }

            this.scheduleNextPoll();
        }
    }

    private scheduleNextPoll(): void {
        this.currentTimeout = setTimeout(() => this.runPoll(), this.currentDelay);
    }
}
