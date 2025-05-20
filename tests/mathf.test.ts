import { Mathf } from '../src';


describe('Mathf.clamp', () => {
    it('returns min when value is below range', () => {
        expect(Mathf.clamp(-5, 0, 10)).toBe(0);
    });

    it('returns max when value is above range', () => {
        expect(Mathf.clamp(15, 0, 10)).toBe(10);
    });

    it('returns value when within range', () => {
        expect(Mathf.clamp(5, 0, 10)).toBe(5);
    });
});

describe('Mathf.lerp', () => {
    it('returns start when t is 0', () => {
        expect(Mathf.lerp(2, 8, 0)).toBe(2);
    });

    it('returns end when t is 1', () => {
        expect(Mathf.lerp(2, 8, 1)).toBe(8);
    });

    it('interpolates correctly for t between 0 and 1', () => {
        expect(Mathf.lerp(2, 8, 0.5)).toBe(5);
    });

    it('extrapolates when t is outside [0,1]', () => {
        expect(Mathf.lerp(2, 8, -0.5)).toBe(-1);
        expect(Mathf.lerp(2, 8, 1.5)).toBe(11);
    });
});

describe('Mathf.max', () => {
    it('returns undefined for empty iterable', () => {
        expect(Mathf.max([], x => x)).toBeUndefined();
    });

    it('returns the element with the highest number', () => {
        const arr = [{ v: 1 }, { v: 5 }, { v: 3 }];
        expect(Mathf.max(arr, x => x.v)).toEqual({ v: 5 });
    });

    it('returns first max when there are duplicates', () => {
        const arr = [{ v: 5 }, { v: 5 }, { v: 3 }];
        expect(Mathf.max(arr, x => x.v)).toEqual({ v: 5 });
    });
});

describe('Mathf.min', () => {
    it('returns undefined for empty iterable', () => {
        expect(Mathf.min([], x => x)).toBeUndefined();
    });

    it('returns the element with the lowest number', () => {
        const arr = [{ v: 1 }, { v: 5 }, { v: -2 }];
        expect(Mathf.min(arr, x => x.v)).toEqual({ v: -2 });
    });

    it('returns first min when there are duplicates', () => {
        const arr = [{ v: -2 }, { v: -2 }, { v: 3 }];
        expect(Mathf.min(arr, x => x.v)).toEqual({ v: -2 });
    });
});
