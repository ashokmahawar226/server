module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\.tsx?$': 'ts-jest'
  },
  moduleNameMapper: {
    '@controllers/(.*)': '<rootDir>/src/controllers/',
    '@models/(.*)': '<rootDir>/src/models/',
    '@routes/(.*)': '<rootDir>/src/routes/',
    '@services/(.*)': '<rootDir>/src/services/',
    '@middleware/(.*)': '<rootDir>/src/middleware/',
    '@config/(.*)': '<rootDir>/src/config/',
    '@utils/(.*)': '<rootDir>/src/utils/',
    '@types/(.*)': '<rootDir>/src/types/'
  }
};
