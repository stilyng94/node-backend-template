module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	setupFilesAfterEnv: ['<rootDir>/src/test/setup-test.ts'],
	testMatch: ['**/__tests__/**/*.+(ts|js)', '**/?(*.)+(spec|test).+(ts|js)'],
	transform: {
		'^.+\\.(ts)$': 'ts-jest',
	},
};
