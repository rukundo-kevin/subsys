module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
  restoreMocks: true,
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  coveragePathIgnorePatterns: ['node_modules', 'src/config', 'src/app.ts'],
  coverageReporters: ['text', 'lcov', 'clover', 'html']
};
