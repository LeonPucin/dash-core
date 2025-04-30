import { TimeSpan, ServiceLogger } from 'dash-kit';

export class AdaptivePoller {
    private currentTimeout: NodeJS.Timeout | undefined = undefined;

    private currentDelay: number;
    private lastErrorTime: number | null = null;

    private polling: boolean = false;
    private operation: (() => Promise<void>) | null = null;
    private onError: ((error: Error) => void) | null = null;
    private onFail: ((error: Error) => void) | null = null;

    public get isPolling(): boolean {
        return this.polling;
    }

    /**
     * @param initialDelay initial interval between operations (in ms)
     * @param logger of the service that uses this polling
     * @param maxDelay maximum interval on errors (in ms)
     * @param factor multiplier for exponential interval increase
     * @param resetPeriod period (in ms) during which if no errors occur, the interval starts to decrease linearly
     * @param linearStep amount (in ms) by which the interval decreases after a successful operation, if resetPeriod has passed
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
