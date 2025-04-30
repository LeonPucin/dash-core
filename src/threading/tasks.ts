import { TimeSpan } from 'dash-kit';

class Tasks {
    static wait(timeSpan: TimeSpan): Promise<void> {
        return new Promise<void>((resolve) => setTimeout(resolve, timeSpan.totalMilliseconds));
    }
}

export function Wait(timeSpan: TimeSpan): Promise<void> {
    return Tasks.wait(timeSpan);
}

export function CreateInterval(callback: () => void, timeSpan: TimeSpan): NodeJS.Timeout {
    return setInterval(callback, timeSpan.totalMilliseconds);
}

export function CreateTimeout(callback: () => void, timeSpan: TimeSpan): NodeJS.Timeout {
    return setTimeout(callback, timeSpan.totalMilliseconds);
}