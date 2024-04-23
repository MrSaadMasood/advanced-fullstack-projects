module.exports = {
  env: {
    browser: true,
    es2021: true,
    "vite-globals/env" : true
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'airbnb',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended', // Recommended rules from TypeScript ESLint
    'plugin:react/recommended', // Recommended rules from React ESLint
    'plugin:jsx-a11y/recommended', // Recommended rules for accessibility in JSX
    'prettier/@typescript-eslint', // Prettier plugin with ESLint for TypeScript
    'plugin:prettier/recommended', // Prettier recommended rules
    "plugin:vitest-globals/recommended"
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect', // Automatically detect the React version
    },
  },
  rules: {
    // React JSX should be in .tsx files
    'react/jsx-filename-extension': ['warn', { extensions: ['.tsx'] }],
    // Allow imports without file extensions for TypeScript files
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
        tsx: 'never',
      },
    ],
    // Disable 'no-shadow' rule and use TypeScript version
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    // Specify function return types explicitly
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      {
        allowExpressions: true,
      },
    ],
    // Enforce rules of Hooks
    'react-hooks/rules-of-hooks': 'error',
    // Warn when dependencies are not listed in useEffect/useCallback
    'react-hooks/exhaustive-deps': 'warn',
    // Limit lines to 80 characters
    'max-len': ['warn', { code: 80 }],
    // Disallow the use of 'any' type
    '@typescript-eslint/no-explicit-any': 'error',
    // Disallow misuse of the 'new' operator with classes
    '@typescript-eslint/no-misused-new': 'error',
    // Warn on potential misuse of promises
    '@typescript-eslint/no-misused-promises': 'warn',
    // Warn on unnecessary type constraint
    '@typescript-eslint/no-unnecessary-type-constraint': 'warn',
    // Warn on unnecessary type assertion
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    // Disallow unused variables, except those prefixed with '_'
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // Warn on exporting non-component symbols with React Refresh
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
};
