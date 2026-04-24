const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: '../../',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/tests/unit/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/tests/unit/**/*.[jt]s?(x)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx}',
  ],
}

module.exports = createJestConfig(customJestConfig)
