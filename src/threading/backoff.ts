import { TimeSpan, Wait } from 'dash-core';


/**
 * Implements exponential backoff with optional jitter for retrying operations.
 */
export class ExponentialBackoff {
    /**
     * Creates an instance of the ExponentialBackoff class with the specified options.
     * @param {ExponentialBackoffOptions} options - Configuration options for the backoff mechanism.
     * @param {TimeSpan} options.initialDelay - The initial delay before the first retry attempt.
     * @param {TimeSpan} options.maxDelay - The maximum delay allowed between retries.
     * @param {number} options.factor - The factor by which the delay increases after each failure.
     * @param {TimeSpan} [options.jitter] - An optional jitter value that is added randomly to the delay (optional).
     */
    constructor(private readonly options: ExponentialBackoffOptions) {
    }

    /**
     * Executes the given operation and applies exponential backoff with retries.
     * The operation will be retried until it succeeds or the maximum delay is reached.
     * @param {() => Promise<TResult>} operation - The asynchronous operation to execute and retry in case of failure.
     * @returns {Promise<TResult>} A promise that resolves with the result of the operation if it succeeds, or rejects with the last error if all attempts fail.
     */
    public execute<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
        return new Promise(async (resolve, reject) => {
            let lastError: Error | unknown = null;
            let currentDelay = this.options.initialDelay;

            while (currentDelay <= this.options.maxDelay) {
                try {
                    const result = await this.attempt(operation);
                    resolve(result);
                    return;
                } catch (error) {
                    lastError = error;
                    await Wait(currentDelay);
                    currentDelay = this.getUpdatedDelay(currentDelay);
                }
            }

            reject(lastError);
        });
    }

    private attempt<TResult>(operation: () => Promise<TResult>) {
        return new Promise<TResult>(async (resolve, reject) => {
            try {
                const result = await operation();
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    private getUpdatedDelay(currentDelay: TimeSpan): TimeSpan {
        const jitter = this.options.jitter ? Math.random() * this.options.jitter.totalMilliseconds : 0;
        const newDelay = (currentDelay.totalMilliseconds * this.options.factor) + jitter;
        return TimeSpan.fromMilliseconds(newDelay);
    }
}

export type ExponentialBackoffOptions = {
    initialDelay: TimeSpan,
    maxDelay: TimeSpan,
    factor: number,
    jitter?: TimeSpan
}
