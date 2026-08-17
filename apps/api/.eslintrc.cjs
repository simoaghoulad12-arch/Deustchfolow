module.exports = {
  root: true,
  extends: [require.resolve('@deutschflow/config/eslint/nest')],
  parserOptions: {
    sourceType: 'module',
  },
  overrides: [
    {
      // CLI scripts (Phase 4.5 manual AI integration test / eval suite runner)
      // — console output is their whole purpose, not something to warn on.
      files: ['scripts/**/*.ts'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
