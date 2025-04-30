import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ExponentialBackoff, ExponentialBackoffOptions, TimeSpan } from 'dash-core';

/**
 * Provides HTTP GET and POST requests with retries using exponential backoff.
 */
export class RestRequest {
    private readonly throwException: boolean;
    private backoff: ExponentialBackoff;

    /**
     * Creates an instance of the RestRequest class.
     * @param {boolean} [throwException=false] - Whether to throw the error after retries fail. If false, the promise will reject.
     * @param {ExponentialBackoffOptions} [backoffOption] - The configuration for the exponential backoff algorithm.
     *      If not provided, defaults will be used (initial delay: 5 seconds, max delay: 30 seconds, factor: 2).
     */
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

    /**
     * Makes an HTTP GET request to the specified URL with the optional configuration and retries on failure.
     * The request is retried using exponential backoff.
     * @param {string} url - The URL to send the GET request to.
     * @param {AxiosRequestConfig} [config] - The optional configuration for the GET request.
     * @returns {Promise<AxiosResponse<T>>} A promise that resolves with the response of the GET request.
     */
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

    /**
     * Makes an HTTP POST request to the specified URL with the provided data and optional configuration and retries on failure.
     * The request is retried using exponential backoff.
     * @param {string} url - The URL to send the POST request to.
     * @param {any} [data] - The optional data to send in the body of the POST request.
     * @param {AxiosRequestConfig} [config] - The optional configuration for the POST request.
     * @returns {Promise<AxiosResponse<T>>} A promise that resolves with the response of the POST request.
     */
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