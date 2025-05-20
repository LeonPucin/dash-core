/**
 * Represents a time interval measured in milliseconds.
 */
export class TimeSpan {
    private readonly ms: number;

    /**
     * Initializes a new instance of the TimeSpan class.
     * @param milliseconds Number of milliseconds in the interval. Must be ≥ 0.
     * @throws Error if `milliseconds` is negative.
     */
    constructor(milliseconds: number = 0) {
        if (milliseconds < 0) {
            throw new Error('Milliseconds cannot be negative');
        }
        this.ms = milliseconds;
    }

    /**
     * Gets a TimeSpan representing zero milliseconds.
     * @returns A TimeSpan of 0 milliseconds.
     */
    static zero(): TimeSpan {
        return new TimeSpan(0);
    }

    /**
     * Creates a new TimeSpan from an existing one.
     * @param timeSpan The source TimeSpan to copy.
     * @returns A new TimeSpan with the same duration as `timeSpan`.
     */
    static fromTimeSpan(timeSpan: TimeSpan): TimeSpan {
        return new TimeSpan(timeSpan.ms);
    }

    /**
     * Creates a TimeSpan for the specified number of days.
     * @param days Number of days.
     * @returns A TimeSpan equal to `days` 24 hours.
     */
    static fromDays(days: number): TimeSpan {
        return new TimeSpan(days * 24 * 60 * 60 * 1000);
    }

    /**
     * Creates a TimeSpan for the specified number of hours.
     * @param hours Number of hours.
     * @returns A TimeSpan equal to `hours` 60 minutes.
     */
    static fromHours(hours: number): TimeSpan {
        return new TimeSpan(hours * 60 * 60 * 1000);
    }

    /**
     * Creates a TimeSpan for the specified number of minutes.
     * @param minutes Number of minutes.
     * @returns A TimeSpan equal to `minutes` 60 seconds.
     */
    static fromMinutes(minutes: number): TimeSpan {
        return new TimeSpan(minutes * 60 * 1000);
    }

    /**
     * Creates a TimeSpan for the specified number of seconds.
     * @param seconds Number of seconds.
     * @returns A TimeSpan equal to `seconds` 1000 milliseconds.
     */
    static fromSeconds(seconds: number): TimeSpan {
        return new TimeSpan(seconds * 1000);
    }

    /**
     * Creates a TimeSpan for the specified number of milliseconds.
     * @param milliseconds Number of milliseconds.
     * @returns A TimeSpan equal to `milliseconds`.
     */
    static fromMilliseconds(milliseconds: number): TimeSpan {
        return new TimeSpan(milliseconds);
    }

    /**
     * Gets the total number of milliseconds in this interval.
     */
    get totalMilliseconds(): number {
        return this.ms;
    }

    /**
     * Gets the total number of seconds in this interval, including fractional.
     */
    get totalSeconds(): number {
        return this.ms / 1000;
    }

    /**
     * Gets the total number of minutes in this interval, including fractional.
     */
    get totalMinutes(): number {
        return this.ms / (60 * 1000);
    }

    /**
     * Gets the total number of hours in this interval, including fractional.
     */
    get totalHours(): number {
        return this.ms / (60 * 60 * 1000);
    }

    /**
     * Gets the total number of days in this interval, including fractional.
     */
    get totalDays(): number {
        return this.ms / (24 * 60 * 60 * 1000);
    }

    /**
     * Adds another TimeSpan to this one.
     * @param other The interval to add.
     * @returns A new TimeSpan equal to the sum of this and `other`.
     */
    add(other: TimeSpan): TimeSpan {
        return new TimeSpan(this.ms + other.ms);
    }

    /**
     * Subtracts another TimeSpan from this one.
     * @param other The interval to subtract.
     * @returns A new TimeSpan equal to the difference of this and `other`.
     */
    subtract(other: TimeSpan): TimeSpan {
        return new TimeSpan(this.ms - other.ms);
    }

    /**
     * Determines whether this TimeSpan is equal to another.
     * @param other The TimeSpan to compare.
     * @returns `true` if both intervals have the same duration; otherwise, `false`.
     */
    equals(other: TimeSpan): boolean {
        return this.ms === other.ms;
    }

    /**
     * Returns the primitive value (milliseconds) of this TimeSpan.
     * Enables using `+` or comparisons directly on instances.
     */
    valueOf(): number {
        return this.ms;
    }
}
