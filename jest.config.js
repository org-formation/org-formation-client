const defaultConfig = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    globals: {
        // 'ts-jest': {
        //     compiler: 'ts-node'
        // }
    },
};

module.exports = {

    projects: [
        {
            ...defaultConfig,
            displayName: {
                name: 'unit-test',
                color: 'blue',
            },
            testMatch: ['<rootDir>/test/**/*.test.ts'],
        }
    ]
};
