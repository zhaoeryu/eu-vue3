const path = require('path');

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    'vue/setup-compiler-macros': true // 支持 Vue 的 <script setup> 宏
  },
  // 解析器配置
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser', // 用于解析 TypeScript
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  // 继承的规则集
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // 整合 Prettier
    'plugin:import/recommended',
    'plugin:import/typescript'
  ],
  // 插件
  plugins: [
    'vue',
    '@typescript-eslint',
    'prettier',
    'import'
  ],
  // 自定义规则
  rules: {
    // 基础 JavaScript 规则
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': 'off', // 由 @typescript-eslint 接管
    'no-undef': 'off', // TypeScript 类型检查更严格

    // Vue 规则
    'vue/script-setup-uses-vars': 'error', // 确保 script-setup 中声明的变量被使用
    'vue/no-unused-components': 'warn', // 未使用的组件警告
    'vue/no-mutating-props': 'warn', // 不允许修改 props
    'vue/html-self-closing': ['error', {
      html: {
        void: 'always',
        normal: 'always',
        component: 'off'
      },
      svg: 'always',
      math: 'always'
    }],
    'vue/multi-word-component-names': ['warn', {
      ignores: ['index'] // 允许 index.vue 作为单字组件名
    }],

    // TypeScript 规则
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/explicit-module-boundary-types': 'off', // 关闭显式返回类型要求

    // Import 规则
    'import/order': ['warn', {
      'newlines-between': 'always',
      groups: [
        ['builtin', 'external'],
        'internal',
        ['parent', 'sibling', 'index']
      ]
    }],

    // Prettier 规则（通过 eslint-plugin-prettier 关联）
    'prettier/prettier': 'error',
  },
  // 针对特定文件的配置
  overrides: [
    {
      files: ['*.json'],
      rules: {
        'quote-props': ['error', 'always']
      }
    }
  ],
  settings: {
    'import/resolver': {
      typescript: {
        project: path.resolve(__dirname, './tsconfig.json'),
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
      }
    },
    'vue': {
      'version': '3.x'
    }
  }
};
