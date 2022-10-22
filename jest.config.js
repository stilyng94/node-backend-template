module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	clearMocks: true,
	roots: ['<rootDir>/src'],
	setupFilesAfterEnv: ['<rootDir>/src/test/setup-test.ts'],
	testMatch: ['**/__tests__/**/*.+(ts|js)', '**/?(*.)+(spec|test).+(ts|js)'],
	transform: {
		'^.+\\.(ts)$': 'ts-jest',
		transform_regex: [
			'ts-jest',
			{
				tsConfig: '<rootDir>/tsconfig.json',
				isolatedModules: true,
				diagnostics: false,
			},
		],
	},
	testPathIgnorePatterns: ['/node_modules/'],
};
