module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['./tests/setup.js'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/'
  ],
  collectCoverageFrom: [
    'src/**/*.js'
  ],
  verbose: true
};
