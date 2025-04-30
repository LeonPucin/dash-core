import { TimeSpan } from 'dash-core';

class Tasks {
    /** Waits for the given `TimeSpan` before resolving. */
    static wait(timeSpan: TimeSpan): Promise<void> {
        return new Promise<void>((resolve) => setTimeout(resolve, timeSpan.totalMilliseconds));
    }
}

/** Waits for the given `TimeSpan` before resolving. */
export function Wait(timeSpan: TimeSpan): Promise<void> {
    return Tasks.wait(timeSpan);
}

/**
 * Creates a recurring interval that calls the callback at the specified interval.
 * @param {() => void} callback - Function to call on each interval.
 * @param {TimeSpan} timeSpan - Duration between calls.
 * @returns {NodeJS.Timeout} Interval identifier.
 */
export function CreateInterval(callback: () => void, timeSpan: TimeSpan): NodeJS.Timeout {
    return setInterval(callback, timeSpan.totalMilliseconds);
}

/**
 * Creates a timeout to call the callback after the specified delay.
 * @param {() => void} callback - Function to call after the delay.
 * @param {TimeSpan} timeSpan - Delay duration.
 * @returns {NodeJS.Timeout} Timeout identifier.
 */
export function CreateTimeout(callback: () => void, timeSpan: TimeSpan): NodeJS.Timeout {
    return setTimeout(callback, timeSpan.totalMilliseconds);
}