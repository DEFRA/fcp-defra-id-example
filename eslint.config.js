import neostandard from 'neostandard'

export default [
  ...neostandard({
    ignores: ['src/assets/**']
  }),
  {
    rules: {
      curly: ['error', 'all']
    }
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly'
      }
    }
  }
]
