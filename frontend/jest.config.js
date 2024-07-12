//frontend/jest.config.js
module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
        '^.+\\.(css|scss|png|jpg|jpeg|gif|ttf|woff|woff2)$': 'jest-transform-stub',
    },
};
