import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tailwindcss from 'eslint-plugin-tailwindcss';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  { ignores: ['dist'] },
  js.configs.recommended,

  {
    files: ['**/*.{js,jsx}'],
    extends: [tailwindcss.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // 1. SILENCE THE CONFIGURATION NOISE (Removes ~350+ errors)
      'react/react-in-jsx-scope': 'off',     // Not required in modern React
      'react/prop-types': 'off',             // Turn off if you aren't using the old prop-types package
      'react/no-unescaped-entities': 'off',   // Stops linter from complaining about raw quotes/apostrophes
      
      // Tailwind Rule Customizations
      'tailwindcss/classnames-order': 'warn',       
      'tailwindcss/no-custom-classname': 'warn',   
      'tailwindcss/enforces-shorthand': 'warn',
    },
    settings: {
      // 2. FIXES THE "React version not specified" WARNING
      react: {
        version: 'detect', 
      },
      tailwindcss: {
        cssConfigPath: './src/index.css', 
      },
    },
  },
]);