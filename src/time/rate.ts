import { TimeSpan } from "dash-core";


/**
 * Represents a frequency as occurrences per given time span.
 * Provides a computed delay between each occurrence.
 */
export class Rate {
    /** Occurrences per interval */
    readonly rate: number;
    /** Time span over which the rate applies */
    readonly interval: TimeSpan;

    /**
     * @param rate Number of occurrences per interval (must be > 0)
     * @param interval Time span over which the rate applies
     */
    constructor(rate: number, interval: TimeSpan) {
        if (rate <= 0) {
            throw new Error("Rate must be a positive number");
        }

        this.rate = rate;
        this.interval = interval;
    }

    /**
     * Create a Rate instance.
     * @param rate Number of occurrences per interval (must be > 0)
     * @param interval Time span over which the rate applies
     */
    static of(rate: number, interval: TimeSpan): Rate {
        return new Rate(rate, interval);
    }

    /**
     * Delay between occurrences as a TimeSpan.
     */
    get delay(): TimeSpan {
        const millis = this.interval.totalMilliseconds / this.rate;
        return TimeSpan.fromMilliseconds(millis);
    }
}
