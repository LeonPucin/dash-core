import { TimeSpan, Rate } from 'dash-core';


describe('Rate class', () => {
    it('should throw an error if rate is less than or equal to 0', () => {
        expect(() => new Rate(0, TimeSpan.fromSeconds(1))).toThrow('Rate must be a positive number');
        expect(() => new Rate(-1, TimeSpan.fromSeconds(1))).toThrow('Rate must be a positive number');
        expect(() => Rate.of(-1, TimeSpan.fromSeconds(1))).toThrow('Rate must be a positive number');
    });

    it('should correctly calculate the delay', () => {
        const rate = new Rate(2, TimeSpan.fromSeconds(10));
        const expectedDelay = TimeSpan.fromSeconds(5);

        expect(rate.delay.totalMilliseconds).toBe(expectedDelay.totalMilliseconds);
    });

    it('should return a Rate instance from the static of method', () => {
        const rate = Rate.of(5, TimeSpan.fromMinutes(1));

        expect(rate).toBeInstanceOf(Rate);
        expect(rate.rate).toBe(5);
        expect(rate.interval.totalMilliseconds).toBe(TimeSpan.fromMinutes(1).totalMilliseconds);
        expect(rate.delay.totalMilliseconds).toBe(TimeSpan.fromSeconds(12).totalMilliseconds);
    });

    it('should handle large rate and interval values', () => {
        const rate = new Rate(1000, TimeSpan.fromHours(1));
        const expectedDelay = TimeSpan.fromMilliseconds(3600);

        expect(rate.delay.totalMilliseconds).toBe(expectedDelay.totalMilliseconds);
    });
});
