module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'react-hooks'
  ],
  rules: {
    // React Rules
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': 'off', // Using TypeScript for type checking

    // TypeScript Security Rules
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/explicit-function-return-type': ['warn', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true
    }],
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/strict-boolean-expressions': 'off',

    // Security Best Practices
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-eval': 'error', // Prevent eval() - security risk
    'no-implied-eval': 'error', // Prevent setTimeout/setInterval with strings
    'no-new-func': 'error', // Prevent Function constructor
    'no-script-url': 'error', // Prevent javascript: URLs
    'no-return-await': 'warn', // Performance optimization

    // Web3 Security Rules
    'no-floating-promises': 'off', // Handled by TypeScript
    'require-await': 'warn', // Ensure async functions use await

    // Code Quality & Performance
    'prefer-const': 'warn', // Immutability for security
    'no-var': 'error', // Use let/const for block scoping
    'eqeqeq': ['error', 'always'], // Strict equality prevents type coercion bugs
    'curly': ['warn', 'all'], // Always use braces for clarity
    'no-throw-literal': 'error', // Throw Error objects only

    // DoS Prevention
    'no-constant-condition': 'warn', // Prevent infinite loops
    'no-unreachable': 'error', // Dead code detection
    'max-depth': ['warn', 4], // Limit nesting for readability
    'complexity': ['warn', 15] // Cyclomatic complexity threshold
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    'cache',
    'artifacts',
    'typechain-types',
    '*.cjs'
  ]
};
