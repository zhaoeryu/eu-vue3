// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    'vue/setup-compiler-macros': true, // 支持 Vue 的 <script setup> 宏
  },
  // 解析器配置
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser', // 用于解析 TypeScript
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  // 继承的规则集
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // 整合 Prettier
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  // 插件
  plugins: ['vue', '@typescript-eslint', 'prettier', 'import', 'unused-imports'],
  // 自定义规则
  rules: {
    // 基础 JavaScript 规则
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': 'off', // 由 @typescript-eslint 接管
    'no-undef': 'off', // TypeScript 类型检查更严格
    'import/no-unresolved': [
      'error',
      {
        // 虚拟路径忽略
        ignore: ['virtual:'],
      },
    ],

    // Vue 规则
    // 禁用组件名必须为多单词的检查
    'vue/script-setup-uses-vars': 'error', // 确保 script-setup 中声明的变量被使用
    'vue/no-unused-components': 'error', // 未使用的组件警告
    'vue/no-mutating-props': 'error', // 不允许修改 props
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'always',
          component: 'any',
        },
        svg: 'always',
        math: 'always',
      },
    ],
    // 禁用组件名必须为多单词的检查
    'vue/multi-word-component-names': 'off',

    // TypeScript 规则
    // '@typescript-eslint/no-unused-vars': [
    //   'error',
    //   {
    //     // 自动修复相关配置
    //     argsIgnorePattern: '^_', // 忽略下划线开头的参数（如 _param）
    //     varsIgnorePattern: '^_', // 忽略下划线开头的变量（如 _temp）
    //     caughtErrorsIgnorePattern: '^_', // 忽略下划线开头的捕获错误（如 catch (_e)）
    //   },
    // ],
    // 自动删除未使用的导入（核心修复能力）
    'unused-imports/no-unused-imports': 'error',

    // 禁用原生规则，使用增强版
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-vars': [
      'error',
      {
        // 允许下划线开头的变量（视为"故意未使用"）
        varsIgnorePattern: '^_',
        // 数组解构中未使用的元素会自动添加下划线
        destructuredArrayIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',

        // 自动修复行为：
        // 1. 完全未使用的变量 → 自动删除
        // 2. 未使用的参数 → 自动添加下划线前缀（如 name → _name）
      },
    ],

    '@typescript-eslint/explicit-module-boundary-types': 'off', // 关闭显式返回类型要求
    '@typescript-eslint/no-explicit-any': 'off', // 允许使用any

    // Import 规则
    'import/order': [
      'warn',
      {
        'newlines-between': 'always',
        groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
      },
    ],

    // Prettier 规则（通过 eslint-plugin-prettier 关联）
    'prettier/prettier': [
      'error',
      {
        // 一行最多 200 个字符
        printWidth: 200,
        // 使用 2 个空格缩进
        tabWidth: 2,
        // 不使用制表符缩进
        useTabs: false,
        // 行尾需要有分号
        semi: true,
        // 使用单引号代替双引号
        singleQuote: true,
        // 对象的 key 仅在必要时用引号
        quoteProps: 'as-needed',
        // 多行数组末尾不加逗号
        // trailingComma: 'none',
        // 大括号内的首尾需要空格
        bracketSpacing: true,
        // 箭头函数，只有一个参数的时候，也需要括号
        arrowParens: 'always',
        // 每个文件格式化的范围是文件的全部内容
        rangeStart: 0,
        rangeEnd: Infinity,
        // 不需要写文件开头的 @prettier
        requirePragma: false,
        // 不需要自动在文件开头插入 @prettier
        insertPragma: false,
        // 使用默认的折行标准
        proseWrap: 'preserve',
        // 根据显示样式决定 html 要不要折行
        htmlWhitespaceSensitivity: 'css',
        // 换行符使用 lf
        endOfLine: 'lf',
        // 格式化嵌入的内容
        embeddedLanguageFormatting: 'auto',
        // vue 文件中的 script 和 style 内不用缩进
        vueIndentScriptAndStyle: false,
      },
    ],
  },
  // 针对特定文件的配置
  overrides: [
    {
      files: ['*.json'],
      rules: {
        'quote-props': ['error', 'always'],
      },
    },
  ],
  settings: {
    'import/resolver': {
      typescript: {
        project: path.resolve(__dirname, './tsconfig.json'),
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
      },
    },
    'import/ignore': [
      '@vitejs/plugin-vue', // 忽略该模块的导入检查
    ],
    vue: {
      version: '3.x',
    },
  },
};
