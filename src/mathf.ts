/**
 * The `Mathf` class provides static utility methods for common mathematical operations.
 */
export class Mathf {
    /**
     * Clamps a value within the specified range.
     * @param {number} value - The value to clamp.
     * @param {number} min - The minimum allowable value.
     * @param {number} max - The maximum allowable value.
     * @returns {number} The clamped value, which is within the specified range [min, max].
     */
    public static clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Linearly interpolates between two values based on the interpolation factor.
     * @param {number} a - The start value.
     * @param {number} b - The end value.
     * @param {number} t - The interpolation factor (should be between 0 and 1).
     * @returns {number} The interpolated value, calculated as a + (b - a) * t.
     */
    public static lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }

    /**
     * Finds the maximum element in an iterable based on a selector function.
     * The selector function is used to extract the value that will be compared.
     * @param {Iterable<TType>} array - The iterable collection to search through.
     * @param {(item: TType) => number} selector - A function that extracts a numerical value from each item.
     * @returns {TType | undefined} The item with the highest value according to the selector function, or `undefined` if the iterable is empty.
     */
    public static max<TType>(array: Iterable<TType>, selector: (item: TType) => number): TType | undefined {
        let max = Number.MIN_VALUE;
        let result: TType | undefined = undefined;

        for (const item of array) {
            const value = selector(item);
            if (value > max) {
                max = value;
                result = item;
            }
        }

        return result;
    }

    /**
     * Finds the minimum element in an iterable based on a selector function.
     * The selector function is used to extract the value that will be compared.
     * @param {Iterable<TType>} array - The iterable collection to search through.
     * @param {(item: TType) => number} selector - A function that extracts a numerical value from each item.
     * @returns {TType | undefined} The item with the lowest value according to the selector function, or `undefined` if the iterable is empty.
     */
    public static min<TType>(array: Iterable<TType>, selector: (item: TType) => number): TType | undefined {
        let min = Number.MAX_VALUE;
        let result: TType | undefined = undefined;

        for (const item of array) {
            const value = selector(item);
            if (value < min) {
                min = value;
                result = item;
            }
        }

        return result;
    }
}
