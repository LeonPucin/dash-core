import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ExponentialBackoff, ExponentialBackoffOptions, TimeSpan } from 'dash-kit';

export class RestRequest {
    private readonly throwException: boolean;
    private backoff: ExponentialBackoff;

    constructor(throwException: boolean = false, backoffOption?: ExponentialBackoffOptions) {
        this.throwException = throwException;

        if (!backoffOption)
            backoffOption = {
                initialDelay: TimeSpan.fromSeconds(5),
                maxDelay: TimeSpan.fromSeconds(30),
                factor: 2
            };

        this.backoff = new ExponentialBackoff(backoffOption);
    }

    public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return new Promise<AxiosResponse<T>>((resolve, reject) => {
            this.backoff.execute(() => axios.get<T>(url, config))
                .then((response) => {
                    resolve(response);
                })
                .catch((error) => {
                    reject(error);

                    if (this.throwException)
                        throw error;
                });
        });
    }

    public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return new Promise<AxiosResponse<T>>((resolve, reject) => {
            this.backoff.execute(() => axios.post<T>(url, data, config))
                .then((response) => {
                    resolve(response);
                })
                .catch((error) => {
                    reject(error);

                    if (this.throwException)
                        throw error;
                });
        });
    }
}