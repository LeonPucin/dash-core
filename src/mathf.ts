export class Mathf {
    public static clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    public static lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }

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