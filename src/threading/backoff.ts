import { TimeSpan, Wait } from 'dash-kit';

export class ExponentialBackoff {
    constructor(private readonly options: ExponentialBackoffOptions) {
    }

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