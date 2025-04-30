module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    moduleNameMapper: {
        '^dash-kit$': '<rootDir>/src'
    },
};