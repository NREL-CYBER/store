import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
    "roots": [
        "<rootDir>/tests"
    ],
    "testMatch": [
        "**/__tests__/**/*.+(ts|tsx|js)",
        "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    "transform": {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    "transformIgnorePatterns": [`/node_modules/(?!'validator')`],
};
export default config;

