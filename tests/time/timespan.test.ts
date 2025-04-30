import { TimeSpan } from '../../src';

describe('TimeSpan', () => {
    test('constructor defaults to zero', () => {
        const ts = new TimeSpan();
        expect(ts.totalMilliseconds).toBe(0);
    });

    test('constructor throws on negative values', () => {
        expect(() => new TimeSpan(-5)).toThrow('Milliseconds cannot be negative');
    });

    test('zero returns a span of 0 ms', () => {
        expect(TimeSpan.zero().totalMilliseconds).toBe(0);
    });

    test('fromTimeSpan creates an independent copy', () => {
        const original = TimeSpan.fromHours(3);
        const copy = TimeSpan.fromTimeSpan(original);
        expect(copy).not.toBe(original);
        expect(copy.equals(original)).toBe(true);
    });

    test('fromDays, fromHours, fromMinutes, fromSeconds, fromMilliseconds', () => {
        expect(TimeSpan.fromDays(1).totalHours).toBe(24);
        expect(TimeSpan.fromHours(1).totalMinutes).toBe(60);
        expect(TimeSpan.fromMinutes(1).totalSeconds).toBe(60);
        expect(TimeSpan.fromSeconds(1).totalMilliseconds).toBe(1000);
        expect(TimeSpan.fromMilliseconds(1).totalMilliseconds).toBe(1);
    });

    const complex = new TimeSpan(123456789);
    test('totalSeconds returns correct fractional seconds', () => {
        expect(complex.totalSeconds).toBeCloseTo(123456.789);
    });
    test('totalMinutes returns correct fractional minutes', () => {
        expect(complex.totalMinutes).toBeCloseTo(2057.61315);
    });
    test('totalHours returns correct fractional hours', () => {
        expect(complex.totalHours).toBeCloseTo(34.2935525);
    });
    test('totalDays returns correct fractional days', () => {
        expect(complex.totalDays).toBeCloseTo(1.429731355);
    });

    test('add sums two TimeSpans', () => {
        const a = TimeSpan.fromMinutes(10);
        const b = TimeSpan.fromMinutes(15);
        expect(a.add(b).totalMinutes).toBe(25);
    });

    test('subtract subtracts one TimeSpan from another', () => {
        const a = TimeSpan.fromMinutes(20);
        const b = TimeSpan.fromMinutes(5);
        expect(a.subtract(b).totalMinutes).toBe(15);
        expect(() => b.subtract(a)).toThrow('Milliseconds cannot be negative');
    });

    test('equals returns true for identical spans', () => {
        const x = new TimeSpan(5000);
        const y = TimeSpan.fromSeconds(5);
        expect(x.equals(y)).toBe(true);
    });
});
